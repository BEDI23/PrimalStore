import { createClient } from "@/lib/supabase/server";
import { Categorie, Produit, Promotion } from "@/lib/types";
import { isPromotionActive } from "@/lib/utils";

const PRODUIT_SELECT = "*, categories(nom)";

export async function getCategories(): Promise<Categorie[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("nom", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getProduitsActifs(): Promise<Produit[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("produits")
    .select(PRODUIT_SELECT)
    .eq("actif", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getProduitById(id: string): Promise<Produit | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("produits")
    .select(PRODUIT_SELECT)
    .eq("id", id)
    .eq("actif", true)
    .single();

  if (error) return null;
  return data;
}

export async function getPromotionsActives(): Promise<Promotion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("actif", true);

  if (error) throw error;
  return (data ?? []).filter(isPromotionActive);
}

export async function getAllProduits(): Promise<Produit[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("produits")
    .select(PRODUIT_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getAllPromotions(): Promise<Promotion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getAllCommandes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("commandes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
