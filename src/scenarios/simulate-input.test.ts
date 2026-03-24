import { describe, expect, it } from "bun:test";
import { SCENARIO_SLUGS } from "./registry";
import { validateSimulateInput } from "./simulate-input";

describe("simulate-input", () => {
  it("accepts empty object for any slug", () => {
    for (const slug of SCENARIO_SLUGS) {
      const r = validateSimulateInput(slug, {});
      expect(r.ok).toBe(true);
    }
  });

  it("rejects unknown slug", () => {
    const r = validateSimulateInput("inconnu", {});
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.issues.some((i) => i.path.includes("slug") || i.message.includes("inconnu"))).toBe(
        true,
      );
    }
  });

  it("rejects unknown keys (strict)", () => {
    const r = validateSimulateInput("creche-publique", { monthlyParticipationEur: 100, typo: 1 });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.issues.some((i) => i.message.toLowerCase().includes("unrecognized"))).toBe(true);
    }
  });

  it("rejects invalid types", () => {
    const r = validateSimulateInput("creche-publique", { monthlyParticipationEur: "300" });
    expect(r.ok).toBe(false);
  });

  it("rejects fiscal satellite incomplet (un seul des deux champs)", () => {
    const r = validateSimulateInput("creche-publique", {
      revenuNetImposableEur: 30_000,
    });
    expect(r.ok).toBe(false);
  });

  it("accepte paire revenuNetImposableEur + nombreParts", () => {
    const r = validateSimulateInput("creche-publique", {
      revenuNetImposableEur: 30_000,
      nombreParts: 1,
    });
    expect(r.ok).toBe(true);
  });

  it("rejects negative monthlyParticipationEur (creche)", () => {
    for (const slug of ["creche-publique", "creche-berceau-employeur"] as const) {
      const r = validateSimulateInput(slug, { monthlyParticipationEur: -1 });
      expect(r.ok).toBe(false);
    }
  });

  it("rejects negative monthlyEmploymentCostEur (emploi direct)", () => {
    for (const slug of ["assistante-maternelle", "nounou-domicile"] as const) {
      const r = validateSimulateInput(slug, { monthlyEmploymentCostEur: -1 });
      expect(r.ok).toBe(false);
    }
  });

  it("rejects childrenCount 0 on creche-publique (positive int)", () => {
    const r = validateSimulateInput("creche-publique", { childrenCount: 0 });
    expect(r.ok).toBe(false);
  });

  it("accepts childrenCountForCreditCeiling 0 on nounou-domicile", () => {
    const r = validateSimulateInput("nounou-domicile", { childrenCountForCreditCeiling: 0 });
    expect(r.ok).toBe(true);
  });

  it("rejects nombreParts non positive", () => {
    const r = validateSimulateInput("creche-publique", {
      revenuNetImposableEur: 10_000,
      nombreParts: 0,
    });
    expect(r.ok).toBe(false);
  });
});
