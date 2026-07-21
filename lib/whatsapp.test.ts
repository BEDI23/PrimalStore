import { describe, it, expect } from "vitest";
import { getWhatsAppForwardUrl, buildCommandeRecapMessage } from "./whatsapp";
import { formatPrix } from "./utils";
import type { Commande } from "./api/types";

const commandeBase: Commande = {
  id: 843,
  produitId: 12,
  produitNom: "Huile de palme bio 1L",
  produitPrix: 5000,
  clientNom: "Koffi Mensah",
  clientTelephone: "+22890123456",
  quartier: "Adakpamé",
  quantite: 2,
  prixTotal: 10000,
  message: null,
  statut: "nouvelle",
  createdAt: "2026-07-21T10:00:00.000Z",
};

describe("getWhatsAppForwardUrl", () => {
  it("commence par https://wa.me/?text= sans aucun numéro", () => {
    const url = getWhatsAppForwardUrl("bonjour");
    expect(url.startsWith("https://wa.me/?text=")).toBe(true);
  });

  it("ne contient aucun numéro entre wa.me/ et ?", () => {
    const url = getWhatsAppForwardUrl("bonjour");
    const between = url.slice("https://wa.me/".length, url.indexOf("?"));
    expect(between).toBe("");
  });

  it("encode correctement les espaces (%20) et les sauts de ligne (%0A)", () => {
    const url = getWhatsAppForwardUrl("ligne un\nligne deux avec espace");
    const text = url.slice("https://wa.me/?text=".length);
    expect(text).toContain("%0A");
    expect(text).toContain("%20");
    expect(decodeURIComponent(text)).toBe("ligne un\nligne deux avec espace");
  });
});

describe("buildCommandeRecapMessage", () => {
  it("contient toutes les lignes attendues avec les valeurs de la commande", () => {
    const message = buildCommandeRecapMessage(commandeBase);
    const lines = message.split("\n");

    expect(lines).toEqual([
      `🆕 Nouvelle commande #${commandeBase.id}`,
      `Produit : ${commandeBase.produitNom}`,
      `Quantité : ${commandeBase.quantite}`,
      `Prix unitaire : ${formatPrix(commandeBase.produitPrix)}`,
      `Total : ${formatPrix(commandeBase.prixTotal)}`,
      `Client : ${commandeBase.clientNom}`,
      `Téléphone : ${commandeBase.clientTelephone}`,
      `Quartier : ${commandeBase.quartier}`,
    ]);
  });

  it("contient l'id, le produitNom et le prixTotal", () => {
    const message = buildCommandeRecapMessage(commandeBase);
    expect(message).toContain(String(commandeBase.id));
    expect(message).toContain(commandeBase.produitNom);
    expect(message).toContain(formatPrix(commandeBase.prixTotal));
  });

  it("n'ajoute pas la ligne Message quand message est null", () => {
    const message = buildCommandeRecapMessage({ ...commandeBase, message: null });
    expect(message).not.toContain("Message :");
  });

  it("n'ajoute pas la ligne Message quand message est une chaîne vide", () => {
    const message = buildCommandeRecapMessage({ ...commandeBase, message: "" });
    expect(message).not.toContain("Message :");
  });

  it("ajoute la ligne Message quand message est renseigné", () => {
    const message = buildCommandeRecapMessage({
      ...commandeBase,
      message: "Livrer avant midi",
    });
    expect(message).toContain("Message : Livrer avant midi");
    expect(message.split("\n").at(-1)).toBe("Message : Livrer avant midi");
  });
});
