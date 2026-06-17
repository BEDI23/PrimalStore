import { describe, it, expect } from "vitest";
import { statutsDisponibles, STATUTS_COMMANDE } from "./constants";

describe("statutsDisponibles", () => {
  it("propose les trois statuts depuis « nouvelle »", () => {
    expect(statutsDisponibles("nouvelle")).toEqual([
      "nouvelle",
      "livree",
      "annulee",
    ]);
  });

  it("interdit le retour à « nouvelle » depuis « livree »", () => {
    const dispo = statutsDisponibles("livree");
    expect(dispo).not.toContain("nouvelle");
    expect(dispo).toEqual(["livree", "annulee"]);
  });

  it("interdit le retour à « nouvelle » depuis « annulee »", () => {
    const dispo = statutsDisponibles("annulee");
    expect(dispo).not.toContain("nouvelle");
    expect(dispo).toEqual(["livree", "annulee"]);
  });

  it("permet de corriger livree <-> annulee dans les deux sens", () => {
    expect(statutsDisponibles("livree")).toContain("annulee");
    expect(statutsDisponibles("annulee")).toContain("livree");
  });

  it("expose exactement les trois statuts métier", () => {
    expect(STATUTS_COMMANDE).toEqual(["nouvelle", "livree", "annulee"]);
  });
});
