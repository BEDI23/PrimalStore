import { NextRequest, NextResponse } from "next/server";
import { sendOrderEmail } from "@/lib/notifications/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      produit_nom,
      quantite,
      prix_total,
      client_nom,
      client_telephone,
      quartier,
      message,
    } = body;

    if (!client_nom || !produit_nom) {
      return NextResponse.json(
        { error: "Données de commande incomplètes" },
        { status: 400 }
      );
    }

    const sent = await sendOrderEmail({
      produit_nom,
      quantite: quantite || 1,
      prix_total: prix_total || 0,
      client_nom,
      client_telephone,
      quartier,
      message,
    });

    if (!sent) {
      return NextResponse.json(
        { error: "Erreur envoi email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
