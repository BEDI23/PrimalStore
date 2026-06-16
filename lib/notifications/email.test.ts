import { describe, it, expect } from "vitest";
import { buildOrderEmailHtml, type OrderEmailData } from "./email";

const baseData: OrderEmailData = {
  produit_nom: "Huile essentielle",
  quantite: 2,
  prix_total: 12000,
  client_nom: "Awa Koffi",
  client_telephone: "+22890123456",
  quartier: "Adidogomé",
  message: "Livraison après 18h",
};

describe("buildOrderEmailHtml", () => {
  it("intègre toutes les données de la commande", () => {
    // toLocaleString("fr-FR") sépare les milliers par une espace fine insécable
    // (U+202F) : on normalise les espaces pour comparer de façon fiable.
    const html = buildOrderEmailHtml(baseData).replace(/\s/g, " ");

    expect(html).toContain("Huile essentielle");
    expect(html).toContain("× 2");
    expect(html).toContain("12 000 FCFA");
    expect(html).toContain("Awa Koffi");
    expect(html).toContain("+22890123456");
    expect(html).toContain("Adidogomé");
    expect(html).toContain("Livraison après 18h");
  });

  it("génère un lien WhatsApp à partir du téléphone (chiffres uniquement)", () => {
    const html = buildOrderEmailHtml(baseData);
    expect(html).toContain("https://wa.me/22890123456");
  });

  it("masque la ligne Message quand il est vide", () => {
    const html = buildOrderEmailHtml({ ...baseData, message: null });
    expect(html).not.toContain(">Message<");
  });

  it("échappe le HTML des champs fournis par le client (anti-injection)", () => {
    const html = buildOrderEmailHtml({
      ...baseData,
      client_nom: '<script>alert("x")</script>',
      message: "a & b < c > d",
    });

    // La balise brute ne doit JAMAIS apparaître telle quelle dans le HTML.
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("a &amp; b &lt; c &gt; d");
  });
});
