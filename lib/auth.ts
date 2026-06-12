import { User } from "@supabase/supabase-js";
import { SupabaseClient } from "@supabase/supabase-js";

export async function isAdminUser(
  supabase: SupabaseClient,
  user: User | null
): Promise<boolean> {
  if (!user) return false;

  const { data, error } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Erreur vérification admin:", error.message);
    return false;
  }

  return !!data;
}
