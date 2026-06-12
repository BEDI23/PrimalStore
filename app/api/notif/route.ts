import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppAlert } from "@/lib/notifications/callmebot";

export async function POST(request: NextRequest) {
  try {
    const { client_nom } = await request.json();

    if (!client_nom?.trim()) {
      return NextResponse.json(
        { error: "Nom du client requis" },
        { status: 400 }
      );
    }

    const sent = await sendWhatsAppAlert(client_nom);

    if (!sent) {
      return NextResponse.json(
        { error: "Erreur CallMeBot" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
