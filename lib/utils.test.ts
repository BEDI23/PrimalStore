import { describe, it, expect } from "vitest";
import { computeCommandePricing, validatePhoneTogo } from "./utils";
import type { Promotion } from "./types";

const produit = { id: "p1", nom: "Steak premium", prix: 5000 };

function makePromo(overrides: Partial<Promotion> = {}): Promotion {
  return {
    id: "promo-1",
    produit_id: "p1",
    prix_promo: 3000,
    // Date volontairement très lointaine pour être active quelle que soit
    // l'heure d'exécution du test (déterminisme sans mock d'horloge).
    date_fin: "2999-12-31T00:00:00Z",
    actif: true,
    created_at: "2020-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("computeCommandePricing", () => {
  it("utilise le prix du produit (base de données) sans promo", () => {
    const r = computeCommandePricing(produit, [], 2);
    expect(r.produit_prix).toBe(5000);
    expect(r.quantite).toBe(2);
    expect(r.prix_total).toBe(10000);
    expect(r.produit_nom).toBe("Steak premium");
  });

  it("applique le prix promo quand une promotion est active", () => {
    const r = computeCommandePricing(produit, [makePromo()], 3);
    expect(r.produit_prix).toBe(3000);
    expect(r.prix_total).toBe(9000);
  });

  it("ignore une promotion expirée (date_fin passée)", () => {
    const r = computeCommandePricing(
      produit,
      [makePromo({ date_fin: "2000-01-01T00:00:00Z" })],
      1
    );
    expect(r.produit_prix).toBe(5000);
    expect(r.prix_total).toBe(5000);
  });

  it("ignore une promotion désactivée (actif = false)", () => {
    const r = computeCommandePricing(produit, [makePromo({ actif: false })], 1);
    expect(r.produit_prix).toBe(5000);
  });

  it("ignore une promotion qui concerne un autre produit", () => {
    const r = computeCommandePricing(
      produit,
      [makePromo({ produit_id: "autre" })],
      1
    );
    expect(r.produit_prix).toBe(5000);
  });

  it("ramène une quantité < 1 à 1 (anti valeurs négatives/zéro)", () => {
    expect(computeCommandePricing(produit, [], 0).quantite).toBe(1);
    expect(computeCommandePricing(produit, [], -5).quantite).toBe(1);
    expect(computeCommandePricing(produit, [], 0).prix_total).toBe(5000);
  });

  it("tronque une quantité flottante vers l'entier inférieur", () => {
    const r = computeCommandePricing(produit, [], 2.9);
    expect(r.quantite).toBe(2);
    expect(r.prix_total).toBe(10000);
  });

  it("garantit un prix_total entier même si le prix de base est flottant", () => {
    const r = computeCommandePricing({ ...produit, prix: 1500.5 }, [], 2);
    expect(Number.isInteger(r.produit_prix)).toBe(true);
    expect(Number.isInteger(r.prix_total)).toBe(true);
  });
});

describe("validatePhoneTogo", () => {
  it("accepte un numéro togolais valide", () => {
    expect(validatePhoneTogo("+22890123456")).toBe(true);
  });

  it("accepte les séparateurs courants (espaces, tirets, points)", () => {
    expect(validatePhoneTogo("+228 90 12 34 56")).toBe(true);
    expect(validatePhoneTogo("+228-9012-3456")).toBe(true);
    expect(validatePhoneTogo("+228.90.12.34.56")).toBe(true);
  });

  it("rejette un format incorrect", () => {
    expect(validatePhoneTogo("90123456")).toBe(false);
    expect(validatePhoneTogo("+2289012345")).toBe(false); // 7 chiffres
    expect(validatePhoneTogo("+228901234567")).toBe(false); // 9 chiffres
    expect(validatePhoneTogo("+229 90123456")).toBe(false); // mauvais indicatif
  });
});
