import { describe, expect, it } from "vitest";
import { buildLimitationHints } from "./limitation-hints";

describe("buildLimitationHints", () => {
  it("crèche publique + CMG unsupported : code PSU", () => {
    const hints = buildLimitationHints({
      mode: "creche_publique",
      cmgStatus: "unsupported",
      cmgWarnings: ["cmg_psu_or_non_structure_branch_not_modeled"],
    });
    expect(hints.map((h) => h.code)).toContain("cmg_creche_publique_psu_non_modele");
  });

  it("crèche inter-entreprises : code dédié", () => {
    const hints = buildLimitationHints({
      mode: "creche_inter_entreprises",
      cmgStatus: "unsupported",
      cmgWarnings: ["cmg_psu_or_non_structure_branch_not_modeled"],
    });
    expect(hints.map((h) => h.code)).toContain("cmg_creche_inter_entreprises_non_modele");
  });

  it("CMG ineligible : hint générique", () => {
    const hints = buildLimitationHints({
      mode: "nounou_domicile",
      cmgStatus: "ineligible",
      cmgWarnings: [],
    });
    expect(hints.some((h) => h.code === "cmg_ineligible_parametres")).toBe(true);
  });
});
