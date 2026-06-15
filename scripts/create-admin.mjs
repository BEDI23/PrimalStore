// Crée (ou réutilise) un compte admin pour la boutique.
//
// Usage :
//   node --env-file=.env.local scripts/create-admin.mjs <email> <mot_de_passe>
//
// Ce script :
//   1. crée l'utilisateur dans l'auth Supabase (email déjà confirmé), ou le
//      retrouve s'il existe déjà ;
//   2. insère son id dans la table admin_users (idempotent).
//
// Il utilise la clé service_role (SUPABASE_SERVICE_ROLE_KEY) : à exécuter
// uniquement en local, jamais exposé côté client.

import { createClient } from "@supabase/supabase-js";

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error(
    "Usage : node --env-file=.env.local scripts/create-admin.mjs <email> <mot_de_passe>"
  );
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant (.env.local)."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(targetEmail) {
  // Parcourt les pages d'utilisateurs jusqu'à trouver l'email.
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase());
    if (found) return found;
    if (data.users.length < 200) break;
  }
  return null;
}

async function main() {
  let userId;

  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createErr) {
    // L'utilisateur existe probablement déjà : on le récupère.
    const existing = await findUserByEmail(email);
    if (!existing) {
      console.error("Échec création utilisateur :", createErr.message);
      process.exit(1);
    }
    userId = existing.id;
    console.log(`Utilisateur existant réutilisé (${email}).`);
  } else {
    userId = created.user.id;
    console.log(`Utilisateur créé (${email}).`);
  }

  const { error: insertErr } = await supabase
    .from("admin_users")
    .upsert({ id: userId }, { onConflict: "id" });

  if (insertErr) {
    console.error("Échec ajout dans admin_users :", insertErr.message);
    process.exit(1);
  }

  console.log(`✅ Admin prêt : ${email} (id: ${userId})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
