import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsAppAlert } from "@/lib/notifications/callmebot";
import { sendOrderEmail } from "@/lib/notifications/email";
import { validatePhoneTogo, computeCommandePricing } from "@/lib/utils";
import type { Promotion } from "@/lib/types";

const MAX_QUANTITE = 100;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { produit_id, quantite } = body;

    const client_nom = typeof body.client_nom === "string" ? body.client_nom.trim() : "";
    const client_telephone =
      typeof body.client_telephone === "string" ? body.client_telephone.trim() : "";
    const quartier = typeof body.quartier === "string" ? body.quartier.trim() : "";
    const message =
      typeof body.message === "string" && body.message.trim() ? body.message.trim() : null;

    if (!client_nom || !client_telephone || !quartier || !produit_id) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    if (!validatePhoneTogo(client_telephone)) {
      return NextResponse.json(
        { error: "Numéro de téléphone invalide" },
        { status: 400 }
      );
    }

    const qte = Math.floor(Number(quantite)) || 1;
    if (qte < 1 || qte > MAX_QUANTITE) {
      return NextResponse.json(
        { error: "Quantité invalide" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Source de vérité : on récupère le produit en base. Le prix envoyé par le
    // client est ignoré (anti-falsification).
    const { data: produit, error: produitError } = await supabase
      .from("produits")
      .select("id, nom, prix, actif")
      .eq("id", produit_id)
      .single();

    if (produitError || !produit || !produit.actif) {
      return NextResponse.json(
        { error: "Produit indisponible" },
        { status: 400 }
      );
    }

    // Promotions actives du produit, filtrées côté serveur.
    const { data: promotions } = await supabase
      .from("promotions")
      .select("*")
      .eq("produit_id", produit_id)
      .eq("actif", true);

    const pricing = computeCommandePricing(
      produit,
      (promotions ?? []) as Promotion[],
      qte
    );

    const { data: commande, error } = await supabase
      .from("commandes")
      .insert({
        produit_id: produit.id,
        produit_nom: pricing.produit_nom,
        produit_prix: pricing.produit_prix,
        client_nom,
        client_telephone,
        quartier,
        quantite: pricing.quantite,
        prix_total: pricing.prix_total,
        message,
        statut: "nouvelle",
      })
      .select()
      .single();

    if (error) {
      console.error("Erreur insertion commande:", error);
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement" },
        { status: 500 }
      );
    }

    const orderData = {
      produit_nom: pricing.produit_nom,
      quantite: pricing.quantite,
      prix_total: pricing.prix_total,
      client_nom,
      client_telephone,
      quartier,
      message,
    };

    const [whatsappOk, emailOk] = await Promise.all([
      sendWhatsAppAlert(client_nom),
      sendOrderEmail(orderData),
    ]);

    if (!whatsappOk) console.error("Erreur notification WhatsApp");
    if (!emailOk) console.error("Erreur notification email Resend");

    return NextResponse.json({ success: true, id: commande.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
