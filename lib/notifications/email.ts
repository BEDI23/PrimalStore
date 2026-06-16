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

/**
 * Échappe les caractères HTML d'une valeur fournie par l'utilisateur avant de
 * l'injecter dans le template. Sans cela, un client pourrait insérer du HTML
 * (voire des balises actives) via son nom, son quartier ou son message.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildOrderEmailHtml(data: OrderEmailData): string {
  const prixFormate = data.prix_total.toLocaleString("fr-FR");
  const produitNom = escapeHtml(data.produit_nom);
  const clientNom = escapeHtml(data.client_nom);
  const clientTel = escapeHtml(data.client_telephone);
  const quartier = escapeHtml(data.quartier);
  const message = data.message?.trim() ? escapeHtml(data.message.trim()) : "";

  // Lien WhatsApp direct vers le client (numéro nettoyé des caractères non
  // numériques, on conserve un éventuel préfixe international).
  const telDigits = data.client_telephone.replace(/[^\d]/g, "");
  const whatsappUrl = `https://wa.me/${telDigits}`;

  const ligne = (label: string, valeur: string, options?: { accent?: boolean }) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#6b7280;font-weight:600;width:120px;vertical-align:top;">${label}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:15px;color:${options?.accent ? "#16a34a" : "#111827"};font-weight:${options?.accent ? "700" : "500"};">${valeur}</td>
    </tr>`;

  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>Nouvelle commande</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
    <!-- Préheader masqué (aperçu boîte de réception) -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Nouvelle commande de ${clientNom} — ${prixFormate} FCFA</div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

            <!-- En-tête -->
            <tr>
              <td style="background-color:#16a34a;background-image:linear-gradient(135deg,#16a34a 0%,#15803d 100%);padding:32px 32px 28px;">
                <p style="margin:0 0 4px;font-size:13px;color:#bbf7d0;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;">${BOUTIQUE_NOM}</p>
                <h1 style="margin:0;font-size:24px;line-height:1.3;color:#ffffff;font-weight:700;">🛒 Nouvelle commande</h1>
              </td>
            </tr>

            <!-- Bandeau total -->
            <tr>
              <td style="padding:24px 32px 8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;">
                  <tr>
                    <td style="padding:16px 20px;">
                      <p style="margin:0 0 2px;font-size:12px;color:#15803d;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Montant total</p>
                      <p style="margin:0;font-size:26px;color:#16a34a;font-weight:800;">${prixFormate} FCFA</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Détails -->
            <tr>
              <td style="padding:16px 32px 8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${ligne("Produit", `${produitNom} <span style="color:#6b7280;font-weight:600;">× ${data.quantite}</span>`)}
                  ${ligne("Client", clientNom)}
                  ${ligne("Téléphone", `<a href="${whatsappUrl}" style="color:#16a34a;text-decoration:none;font-weight:600;">${clientTel}</a>`)}
                  ${ligne("Zone", quartier)}
                  ${message ? ligne("Message", message) : ""}
                </table>
              </td>
            </tr>

            <!-- CTA WhatsApp -->
            <tr>
              <td style="padding:16px 32px 28px;" align="center">
                <a href="${whatsappUrl}" style="display:inline-block;background-color:#16a34a;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:13px 28px;border-radius:10px;">💬 Contacter le client sur WhatsApp</a>
              </td>
            </tr>

            <!-- Pied de page -->
            <tr>
              <td style="background-color:#f9fafb;border-top:1px solid #f0f0f0;padding:20px 32px;">
                <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.5;">
                  Connectez-vous à l'espace admin pour gérer cette commande.<br>
                  <span style="color:#d1d5db;">Email automatique — ${BOUTIQUE_NOM}</span>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
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
