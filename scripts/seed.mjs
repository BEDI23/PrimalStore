// Insère des données de démonstration (catégories, produits, promotion,
// commandes) pour tester l'admin et le site.
//
// Usage :
//   node --env-file=.env.local scripts/seed.mjs
//
// Idempotent : UUID fixes + upsert → relançable sans créer de doublons.
// Utilise la clé service_role (contourne la RLS) : à exécuter en local seulement.
//
// Remarque : image_url est laissé à null car next.config.mjs n'autorise les
// images que depuis le storage Supabase. L'UI affiche alors un placeholder 🌿.
// Pour de vraies images, uploadez-les dans le bucket "produits" puis renseignez
// l'URL publique.

import { createClient } from "@supabase/supabase-js";

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

// --- Catégories (clé naturelle = nom, unique) ---------------------------------
const categoriesNoms = [
  "Santé & Bien-être",
  "Maison",
  "High-Tech",
  "Image & Son",
];

// --- Produits (UUID fixes) ----------------------------------------------------
const P = {
  moringa: "11111111-1111-4111-8111-111111111111",
  miel: "22222222-2222-4222-8222-222222222222",
  verres: "33333333-3333-4333-8333-333333333333",
  lampe: "44444444-4444-4444-8444-444444444444",
  ecouteurs: "55555555-5555-4555-8555-555555555555",
  projecteur: "66666666-6666-4666-8666-666666666666",
};

function produits(catId) {
  return [
    {
      id: P.moringa,
      nom: "Huile essentielle de Moringa",
      description_courte: "Huile 100% naturelle, pressée à froid (50 ml).",
      description_complete:
        "Huile de Moringa pure, riche en antioxydants. Idéale pour la peau et les cheveux. Bouteille en verre de 50 ml.",
      prix: 4500,
      badge: "Nouveau",
      image_url: null,
      categorie_id: catId["Santé & Bien-être"],
      actif: true,
    },
    {
      id: P.miel,
      nom: "Miel naturel 500g",
      description_courte: "Miel pur récolté localement.",
      description_complete:
        "Miel non pasteurisé récolté dans la région des Plateaux. Pot de 500 g.",
      prix: 3000,
      badge: "",
      image_url: null,
      categorie_id: catId["Santé & Bien-être"],
      actif: true,
    },
    {
      id: P.verres,
      nom: "Lot de 6 verres en cristal",
      description_courte: "Service de 6 verres élégants.",
      description_complete:
        "Ensemble de 6 verres en cristal pour vos réceptions. Lavables au lave-vaisselle.",
      prix: 12000,
      badge: "Bestseller",
      image_url: null,
      categorie_id: catId["Maison"],
      actif: true,
    },
    {
      id: P.lampe,
      nom: "Lampe LED rechargeable",
      description_courte: "Autonomie 8h, idéale en cas de coupure.",
      description_complete:
        "Lampe LED rechargeable par USB, 3 niveaux d'intensité, autonomie jusqu'à 8 heures.",
      prix: 8500,
      badge: "",
      image_url: null,
      categorie_id: catId["Maison"],
      actif: true,
    },
    {
      id: P.ecouteurs,
      nom: "Écouteurs Bluetooth sans fil",
      description_courte: "Son clair, boîtier de charge inclus.",
      description_complete:
        "Écouteurs sans fil Bluetooth 5.3 avec boîtier de charge. Jusqu'à 24h d'autonomie totale.",
      prix: 15000,
      badge: "Bestseller",
      image_url: null,
      categorie_id: catId["High-Tech"],
      actif: true,
    },
    {
      id: P.projecteur,
      nom: "Mini projecteur LED Full HD",
      description_courte: "Cinéma à la maison, compatible HDMI/USB.",
      description_complete:
        "Mini projecteur LED résolution native 1080p, compatible HDMI, USB et téléphone. Idéal soirées film.",
      prix: 45000,
      badge: "Nouveau",
      image_url: null,
      categorie_id: catId["Image & Son"],
      actif: true,
    },
  ];
}

// --- Promotion (UUID fixe) ----------------------------------------------------
const promotions = [
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    produit_id: P.ecouteurs,
    prix_promo: 11000,
    date_fin: "2027-12-31T23:59:59Z",
    actif: true,
  },
];

// --- Commandes de démonstration (UUID fixes) ----------------------------------
// Statuts variés + 2 livrées (pour le revenu réel) + dates étalées (filtres).
const commandes = [
  {
    id: "bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1",
    produit_id: P.ecouteurs,
    produit_nom: "Écouteurs Bluetooth sans fil",
    produit_prix: 11000,
    client_nom: "Koffi Mensah",
    client_telephone: "+22890111213",
    quartier: "Adidogomé",
    quantite: 1,
    prix_total: 11000,
    message: "Livraison en soirée si possible.",
    statut: "nouvelle",
  },
  {
    id: "bbbbbbb2-bbbb-4bbb-8bbb-bbbbbbbbbbb2",
    produit_id: P.projecteur,
    produit_nom: "Mini projecteur LED Full HD",
    produit_prix: 45000,
    client_nom: "Ama Doe",
    client_telephone: "+22891222324",
    quartier: "Tokoin",
    quantite: 1,
    prix_total: 45000,
    message: null,
    statut: "confirmee",
    created_at: "2026-06-13T10:30:00Z",
  },
  {
    id: "bbbbbbb3-bbbb-4bbb-8bbb-bbbbbbbbbbb3",
    produit_id: P.verres,
    produit_nom: "Lot de 6 verres en cristal",
    produit_prix: 12000,
    client_nom: "Yawo Agbeko",
    client_telephone: "+22892333435",
    quartier: "Bè",
    quantite: 2,
    prix_total: 24000,
    message: "Emballer comme cadeau.",
    statut: "livree",
    created_at: "2026-06-12T15:00:00Z",
  },
  {
    id: "bbbbbbb4-bbbb-4bbb-8bbb-bbbbbbbbbbb4",
    produit_id: P.miel,
    produit_nom: "Miel naturel 500g",
    produit_prix: 3000,
    client_nom: "Afi Kossi",
    client_telephone: "+22893444546",
    quartier: "Agoè",
    quantite: 3,
    prix_total: 9000,
    message: null,
    statut: "livree",
    created_at: "2026-05-28T09:15:00Z",
  },
  {
    id: "bbbbbbb5-bbbb-4bbb-8bbb-bbbbbbbbbbb5",
    produit_id: P.lampe,
    produit_nom: "Lampe LED rechargeable",
    produit_prix: 8500,
    client_nom: "Komla Adjavon",
    client_telephone: "+22894555657",
    quartier: "Nyékonakpoè",
    quantite: 1,
    prix_total: 8500,
    message: "Finalement plus besoin.",
    statut: "annulee",
    created_at: "2026-06-14T18:45:00Z",
  },
];

async function main() {
  // 1. Catégories (upsert sur le nom unique), puis récupération des ids.
  const { data: catRows, error: catErr } = await supabase
    .from("categories")
    .upsert(
      categoriesNoms.map((nom) => ({ nom })),
      { onConflict: "nom" }
    )
    .select();
  if (catErr) throw catErr;

  const catId = Object.fromEntries(catRows.map((c) => [c.nom, c.id]));
  console.log(`Catégories: ${catRows.length}`);

  // 2. Produits
  const { error: prodErr } = await supabase
    .from("produits")
    .upsert(produits(catId), { onConflict: "id" });
  if (prodErr) throw prodErr;
  console.log("Produits: 6");

  // 3. Promotions
  const { error: promoErr } = await supabase
    .from("promotions")
    .upsert(promotions, { onConflict: "id" });
  if (promoErr) throw promoErr;
  console.log("Promotions: 1");

  // 4. Commandes
  const { error: cmdErr } = await supabase
    .from("commandes")
    .upsert(commandes, { onConflict: "id" });
  if (cmdErr) throw cmdErr;
  console.log("Commandes: 5 (dont 2 livrées → revenu réel 33 000 FCFA)");

  console.log("✅ Données de démonstration insérées.");
}

main().catch((err) => {
  console.error("Échec du seed :", err.message ?? err);
  process.exit(1);
});
