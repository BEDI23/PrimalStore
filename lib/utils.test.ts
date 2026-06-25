import { describe, it, expect } from "vitest";
import { validatePhoneTogo } from "./utils";

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
