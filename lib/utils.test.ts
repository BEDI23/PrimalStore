import { describe, it, expect } from "vitest";
import { validatePhoneTogo, toTelephoneE164 } from "./utils";

describe("validatePhoneTogo", () => {
  it("accepte un numéro togolais valide (8 chiffres, sans indicatif)", () => {
    expect(validatePhoneTogo("90123456")).toBe(true);
  });

  it("accepte les séparateurs courants (espaces, tirets)", () => {
    expect(validatePhoneTogo("90 12 34 56")).toBe(true);
    expect(validatePhoneTogo("90-12-34-56")).toBe(true);
  });

  it("tolère un indicatif éventuellement collé", () => {
    expect(validatePhoneTogo("+22890123456")).toBe(true);
    expect(validatePhoneTogo("22890123456")).toBe(true);
  });

  it("tolère l'indicatif international 00228", () => {
    expect(validatePhoneTogo("0022890123456")).toBe(true);
  });

  it("ne tronque pas un fixe de Lomé commençant par 228 (le reste ferait 5 chiffres)", () => {
    expect(validatePhoneTogo("22812345")).toBe(true);
  });

  it("rejette un format incorrect", () => {
    expect(validatePhoneTogo("9012345")).toBe(false); // 7 chiffres
    expect(validatePhoneTogo("901234567")).toBe(false); // 9 chiffres
    expect(validatePhoneTogo("abcdefgh")).toBe(false);
  });
});

describe("toTelephoneE164", () => {
  it("normalise une saisie locale au format +228XXXXXXXX", () => {
    expect(toTelephoneE164("90 12 34 56")).toBe("+22890123456");
  });

  it("laisse un numéro déjà au format E164 inchangé", () => {
    expect(toTelephoneE164("+22890123456")).toBe("+22890123456");
  });

  it("tolère l'indicatif international 00228 avec séparateurs", () => {
    expect(toTelephoneE164("00228 90 12 34 56")).toBe("+22890123456");
  });

  it("ne tronque pas un fixe de Lomé commençant par 228", () => {
    expect(toTelephoneE164("22812345")).toBe("+22822812345");
  });
});
