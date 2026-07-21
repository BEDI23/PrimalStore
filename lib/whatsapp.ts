import { WHATSAPP_NUMERO } from "./constants";
import { formatPrix } from "./utils";
import type { Commande } from "./api/types";

export function getWhatsAppNumber(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (fromEnv) return fromEnv.replace(/\D/g, "");
  return WHATSAPP_NUMERO.replace(/\D/g, "");
}

export function getWhatsAppUrl(message?: string): string {
  const num = getWhatsAppNumber();
  const base = `https://wa.me/${num}`;
  if (message) {
    return `${base}?text=${encodeURIComponent(message)}`;
  }
  return base;
}

/**
 * Lien profond WhatsApp SANS numéro cible : WhatsApp ouvre le sélecteur de
 * contact et laisse l'utilisateur choisir le destinataire du transfert.
 */
export function getWhatsAppForwardUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/** Construit le récap multi-lignes d'une commande à pré-remplir dans WhatsApp. */
export function buildCommandeRecapMessage(commande: Commande): string {
  const lines = [
    `🆕 Nouvelle commande #${commande.id}`,
    `Produit : ${commande.produitNom}`,
    `Quantité : ${commande.quantite}`,
    `Prix unitaire : ${formatPrix(commande.produitPrix)}`,
    `Total : ${formatPrix(commande.prixTotal)}`,
    `Client : ${commande.clientNom}`,
    `Téléphone : ${commande.clientTelephone}`,
    `Quartier : ${commande.quartier}`,
  ];
  if (commande.message?.trim()) {
    lines.push(`Message : ${commande.message}`);
  }
  return lines.join("\n");
}
