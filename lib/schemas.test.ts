import { describe, it, expect } from "vitest";
import * as v from "valibot";
import {
  commandeSchema,
  loginSchema,
  produitSchema,
  categorieSchema,
  promotionSchema,
} from "./schemas";

/** Petit helper : renvoie la liste des messages d'erreur d'un safeParse. */
function messages(result: { issues?: { message: string }[] }): string[] {
  return (result.issues ?? []).map((i) => i.message);
}

describe("commandeSchema", () => {
  const valide = {
    client_nom: "Awa Koffi",
    client_telephone: "+22890123456",
    quartier: "Adidogomé",
    quantite: 2,
    message: "",
  };

  it("accepte une commande valide", () => {
    const r = v.safeParse(commandeSchema, valide);
    expect(r.success).toBe(true);
  });

  it("trim le nom et le quartier", () => {
    const r = v.safeParse(commandeSchema, {
      ...valide,
      client_nom: "  Awa  ",
      quartier: "  Tokoin ",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.output.client_nom).toBe("Awa");
      expect(r.output.quartier).toBe("Tokoin");
    }
  });

  it("rejette un nom vide ou espaces", () => {
    const r = v.safeParse(commandeSchema, { ...valide, client_nom: "   " });
    expect(r.success).toBe(false);
    expect(messages(r)).toContain("Le nom complet est obligatoire.");
  });

  it("rejette un téléphone hors format togolais", () => {
    const r = v.safeParse(commandeSchema, {
      ...valide,
      client_telephone: "0123456",
    });
    expect(r.success).toBe(false);
    expect(messages(r)).toContain(
      "Numéro invalide. Format attendu : +228XXXXXXXX"
    );
  });

  it("tolère les séparateurs dans le téléphone", () => {
    const r = v.safeParse(commandeSchema, {
      ...valide,
      client_telephone: "+228 90 12 34 56",
    });
    expect(r.success).toBe(true);
  });

  it("rejette une quantité < 1", () => {
    const r = v.safeParse(commandeSchema, { ...valide, quantite: 0 });
    expect(r.success).toBe(false);
    expect(messages(r)).toContain("La quantité minimale est 1.");
  });

  it("rejette une quantité NaN", () => {
    const r = v.safeParse(commandeSchema, { ...valide, quantite: NaN });
    expect(r.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepte un login valide", () => {
    const r = v.safeParse(loginSchema, {
      email: "admin@example.com",
      password: "secret",
    });
    expect(r.success).toBe(true);
  });

  it("rejette un email invalide", () => {
    const r = v.safeParse(loginSchema, { email: "pasunemail", password: "x" });
    expect(r.success).toBe(false);
    expect(messages(r)).toContain("Adresse email invalide.");
  });

  it("rejette un mot de passe vide", () => {
    const r = v.safeParse(loginSchema, {
      email: "admin@example.com",
      password: "",
    });
    expect(r.success).toBe(false);
    expect(messages(r)).toContain("Le mot de passe est obligatoire.");
  });
});

describe("produitSchema", () => {
  const valide = {
    categorie_id: "cat-1",
    nom: "Huile essentielle",
    description_courte: "Bio et naturelle",
    description_complete: "",
    prix: 5000,
    badge: "",
    actif: true,
  };

  it("accepte un produit valide", () => {
    const r = v.safeParse(produitSchema, valide);
    expect(r.success).toBe(true);
  });

  it("rejette un prix négatif", () => {
    const r = v.safeParse(produitSchema, { ...valide, prix: -1 });
    expect(r.success).toBe(false);
    expect(messages(r)).toContain("Le prix doit être un nombre positif.");
  });

  it("rejette un prix NaN (champ vide converti)", () => {
    const r = v.safeParse(produitSchema, { ...valide, prix: NaN });
    expect(r.success).toBe(false);
  });

  it("rejette une catégorie manquante", () => {
    const r = v.safeParse(produitSchema, { ...valide, categorie_id: "" });
    expect(r.success).toBe(false);
    expect(messages(r)).toContain("La catégorie est obligatoire.");
  });
});

describe("categorieSchema", () => {
  it("accepte un nom valide", () => {
    const r = v.safeParse(categorieSchema, { nom: "Cosmétiques" });
    expect(r.success).toBe(true);
  });

  it("rejette un nom vide", () => {
    const r = v.safeParse(categorieSchema, { nom: "   " });
    expect(r.success).toBe(false);
    expect(messages(r)).toContain("Le nom est obligatoire.");
  });
});

describe("promotionSchema", () => {
  const valide = {
    produit_id: "prod-1",
    prix_promo: 3000,
    date_fin: "2026-12-31T23:59",
    actif: true,
  };

  it("accepte une promotion valide", () => {
    const r = v.safeParse(promotionSchema, valide);
    expect(r.success).toBe(true);
  });

  it("rejette une date de fin vide", () => {
    const r = v.safeParse(promotionSchema, { ...valide, date_fin: "" });
    expect(r.success).toBe(false);
    expect(messages(r)).toContain("La date de fin est obligatoire.");
  });

  it("rejette un prix promo négatif", () => {
    const r = v.safeParse(promotionSchema, { ...valide, prix_promo: -5 });
    expect(r.success).toBe(false);
  });
});
