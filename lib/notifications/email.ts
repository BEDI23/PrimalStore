import { Resend } from "resend";
import { BOUTIQUE_NOM } from "@/lib/constants";

export interface OrderEmailData {
  produit_nom: string;
  quantite: number;
  prix_total: number;
  client_nom: string;
  client_telephone: string;
  quartier: string;
  message?: string | null;
}

function buildOrderEmailHtml(data: OrderEmailData): string {
  const prixFormate = data.prix_total.toLocaleString("fr-FR");

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head><meta charset="utf-8"></head>
      <body style="font-family: Inter, Arial, sans-serif; color: #111; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #16a34a; font-size: 22px;">🛒 Nouvelle commande — ${BOUTIQUE_NOM}</h1>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 600; width: 140px;">Produit</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.produit_nom} × ${data.quantite}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 600;">Prix total</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #16a34a; font-weight: 700;">${prixFormate} FCFA</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 600;">Client</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.client_nom}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 600;">Téléphone</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.client_telephone}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 600;">Zone</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.quartier}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: 600;">Message</td>
            <td style="padding: 10px 0;">${data.message?.trim() || "Aucun"}</td>
          </tr>
        </table>
        <p style="margin-top: 24px; font-size: 13px; color: #888;">
          Connectez-vous à l'admin pour gérer cette commande.
        </p>
      </body>
    </html>
  `;
}

export async function sendOrderEmail(data: OrderEmailData): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.RESEND_TO_EMAIL;

  if (!apiKey || !from || !to) {
    console.error("RESEND_API_KEY, RESEND_FROM_EMAIL ou RESEND_TO_EMAIL manquant");
    return false;
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `🛒 Nouvelle commande — ${data.client_nom}`,
      html: buildOrderEmailHtml(data),
    });

    if (error) {
      console.error("Resend error:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Resend fetch error:", err);
    return false;
  }
}
