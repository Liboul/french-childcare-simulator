import { describe, expect, it } from "vitest";
import rulesFr2026 from "../../../config/rules.fr-2026.json" with { type: "json" };
import { parseRulePack } from "../../config/parse";
import { applyCmgCumulFromPack } from "./cumul";
import { estimateCmgMonthlyEur } from "./estimate";

const packResult = parseRulePack(rulesFr2026);
if (!packResult.ok) {
  throw new Error(packResult.error);
}
const pack = packResult.data;

describe("applyCmgCumulFromPack", () => {
  it("PreParE taux plein → 0", () => {
    const r = applyCmgCumulFromPack(pack, 400, {
      receivesPrepareFull: true,
    });
    expect(r.amountEur).toBe(0);
  });

  it("PreParE partiel → moitié", () => {
    const r = applyCmgCumulFromPack(pack, 100, { receivesPreparePartial: true });
    expect(r.amountEur).toBe(50);
  });

  it("AAH/AEEH → ×1,3", () => {
    const r = applyCmgCumulFromPack(pack, 100, { receivesAahOrAeeh: true });
    expect(r.amountEur).toBe(130);
  });
});

describe("estimateCmgMonthlyEur", () => {
  it("emploi direct garde à domicile : formule DR-01 + paramètres pack", () => {
    const r = estimateCmgMonthlyEur(pack, {
      mode: "nounou_domicile",
      cumul: {},
      monthlyReferenceIncomeEur: 4000,
      householdEffortRank: 1,
      hourlyDeclaredGrossEur: 12,
      heuresParMois: 80,
    });
    expect(r.status).toBe("ok");
    expect(r.branch).toBe("emploi_direct_garde_domicile");
    const income = 4000;
    const rate = 0.001238;
    const chr = 10.5;
    const ratio = (income * rate) / chr;
    const factor = 1 - ratio;
    const monthlyCare = 12 * 80;
    const expected = Math.round(Math.max(0, monthlyCare * factor) * 100) / 100;
    expect(r.monthlyCmgEur).toBeCloseTo(expected, 5);
    expect(r.ruleIds).toContain("cmg-emploi-direct-garde-domicile-2026-04");
  });

  it("structure micro-crèche : tranche T1 + plafond 85 % dépense", () => {
    const r = estimateCmgMonthlyEur(pack, {
      mode: "creche_privee",
      cumul: {},
      annualReferenceIncomeN2Eur: 20_000,
      structureDependentChildren: 1,
      isSingleParentHousehold: false,
      childAgeBand: "under3",
      monthlyStructureExpenseEur: 1000,
      territory: "metropole",
      hourlyCrecheFeeEur: 9.5,
    });
    expect(r.status).toBe("ok");
    expect(r.branch).toBe("structure_microcreche");
    expect(r.monthlyCmgEur).toBe(850);
  });

  it("crèche publique : non modélisé (PSU)", () => {
    const r = estimateCmgMonthlyEur(pack, {
      mode: "creche_publique",
      cumul: {},
    });
    expect(r.status).toBe("unsupported");
    expect(r.monthlyCmgEur).toBe(0);
    expect(r.warnings).toContain("cmg_psu_or_non_structure_branch_not_modeled");
  });

  it("micro-crèche : tarif horaire > 10 € → ineligible", () => {
    const r = estimateCmgMonthlyEur(pack, {
      mode: "creche_privee",
      cumul: {},
      annualReferenceIncomeN2Eur: 20_000,
      structureDependentChildren: 1,
      childAgeBand: "under3",
      monthlyStructureExpenseEur: 1000,
      hourlyCrecheFeeEur: 11,
    });
    expect(r.status).toBe("ineligible");
    expect(r.monthlyCmgEur).toBe(0);
  });

  it("cumul PreParE plein sur emploi direct", () => {
    const base = estimateCmgMonthlyEur(pack, {
      mode: "nounou_domicile",
      cumul: {},
      monthlyReferenceIncomeEur: 4000,
      householdEffortRank: 1,
      hourlyDeclaredGrossEur: 12,
      heuresParMois: 80,
    });
    expect(base.monthlyCmgEur).toBeGreaterThan(0);
    const r = estimateCmgMonthlyEur(pack, {
      mode: "nounou_domicile",
      cumul: { receivesPrepareFull: true },
      monthlyReferenceIncomeEur: 4000,
      householdEffortRank: 1,
      hourlyDeclaredGrossEur: 12,
      heuresParMois: 80,
    });
    expect(r.monthlyCmgEur).toBe(0);
  });
});
