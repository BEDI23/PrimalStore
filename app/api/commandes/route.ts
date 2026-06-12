import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsAppAlert } from "@/lib/notifications/callmebot";
import { sendOrderEmail } from "@/lib/notifications/email";
import { validatePhoneTogo } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      produit_id,
      produit_nom,
      produit_prix,
      client_nom,
      client_telephone,
      quartier,
      quantite,
      prix_total,
      message,
    } = body;

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

    const supabase = createAdminClient();

    const { data: commande, error } = await supabase
      .from("commandes")
      .insert({
        produit_id,
        produit_nom,
        produit_prix,
        client_nom,
        client_telephone,
        quartier,
        quantite: quantite || 1,
        prix_total,
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
      produit_nom,
      quantite: quantite || 1,
      prix_total: prix_total || 0,
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
