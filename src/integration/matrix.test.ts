import { describe, expect, it } from "vitest";
import rulesFr2026 from "../../config/rules.fr-2026.json" with { type: "json" };
import { parseRulePack } from "../config/parse";
import { evaluateCesuDeclaratifVsCmg } from "../employer-benefits/cesu-cmg-gate";
import { buildScenarioExportBundle } from "../exporters/bundle";
import { exportScenarioBundleToJson } from "../exporters/json-export";
import { computeScenarioSnapshot } from "../scenario/aggregate";
import type { ScenarioInput } from "../scenario/types";

const packResult = parseRulePack(rulesFr2026);
if (!packResult.ok) {
  throw new Error(packResult.error);
}
const pack = packResult.data;

const household = { taxYear: 2026 };

function assertNonNegativeRac(r: ReturnType<typeof computeScenarioSnapshot>, caseId: string) {
  expect(r.snapshot.netHouseholdBurdenAnnualEur, `${caseId} RAC annuel`).toBeGreaterThanOrEqual(0);
  expect(r.snapshot.netHouseholdBurdenMonthlyEur, `${caseId} RAC mensuel`).toBeGreaterThanOrEqual(
    0,
  );
}

/** Scénarios : id lisible + entrée complète. */
const MATRIX: Array<{ id: string; input: ScenarioInput }> = [
  {
    id: "nounou_domicile_baseline",
    input: {
      household,
      brutInput: {
        mode: "nounou_domicile",
        hourlyGrossEur: 12,
        hoursPerMonth: 80,
        employerShareOfGross: 0.42,
      },
      cmg: {
        cumul: {},
        monthlyReferenceIncomeEur: 4000,
        householdEffortRank: 1,
        hourlyDeclaredGrossEur: 12,
        heuresParMois: 80,
      },
    },
  },
  {
    id: "nounou_prepare_full_cumul",
    input: {
      household,
      brutInput: {
        mode: "nounou_domicile",
        hourlyGrossEur: 12,
        hoursPerMonth: 80,
        employerShareOfGross: 0.42,
      },
      cmg: {
        cumul: { receivesPrepareFull: true },
        monthlyReferenceIncomeEur: 4000,
        householdEffortRank: 1,
        hourlyDeclaredGrossEur: 12,
        heuresParMois: 80,
      },
    },
  },
  {
    id: "micro_creche_ineligible_hourly",
    input: {
      household,
      brutInput: { mode: "creche_privee", monthlyParticipationEur: 1000 },
      cmg: {
        cumul: {},
        annualReferenceIncomeN2Eur: 20_000,
        structureDependentChildren: 1,
        childAgeBand: "under3",
        monthlyStructureExpenseEur: 1000,
        hourlyCrecheFeeEur: 11,
      },
    },
  },
  {
    id: "creche_publique_cmg_unsupported",
    input: {
      household,
      brutInput: { mode: "creche_publique", monthlyParticipationEur: 600 },
      cmg: { cumul: {} },
    },
  },
  {
    id: "assistante_maternelle_credit_hors_domicile",
    input: {
      household,
      brutInput: {
        mode: "assistante_maternelle",
        hourlyGrossEur: 4.5,
        hoursPerMonth: 120,
        careDaysPerMonth: 12,
        indemniteEntretienEurPerDay: 3.5,
        employerShareOfGross: 0.42,
      },
      cmg: {
        cumul: {},
        monthlyReferenceIncomeEur: 3500,
        householdEffortRank: 1,
        hourlyDeclaredGrossEur: 4.5,
        heuresParMois: 120,
      },
    },
  },
  {
    id: "mam_structure",
    input: {
      household,
      brutInput: {
        mode: "mam",
        hourlyGrossEur: 4,
        hoursPerMonth: 100,
        careDaysPerMonth: 10,
        indemniteEntretienEurPerDay: 3,
        structureParticipationEurPerMonth: 40,
        employerShareOfGross: 0.42,
      },
      cmg: {
        cumul: {},
        monthlyReferenceIncomeEur: 3200,
        householdEffortRank: 2,
        hourlyDeclaredGrossEur: 4,
        heuresParMois: 100,
      },
    },
  },
  {
    id: "micro_creche_eligible_plafond_credit",
    input: {
      household,
      brutInput: { mode: "creche_privee", monthlyParticipationEur: 1000 },
      cmg: {
        cumul: {},
        annualReferenceIncomeN2Eur: 20_000,
        structureDependentChildren: 1,
        isSingleParentHousehold: false,
        childAgeBand: "under3",
        monthlyStructureExpenseEur: 1000,
        territory: "metropole",
        hourlyCrecheFeeEur: 9.5,
      },
    },
  },
  {
    id: "nounou_with_prefunded_cesu",
    input: {
      household,
      brutInput: {
        mode: "nounou_domicile",
        hourlyGrossEur: 12,
        hoursPerMonth: 80,
        employerShareOfGross: 0.42,
      },
      cmg: {
        cumul: {},
        monthlyReferenceIncomeEur: 4000,
        householdEffortRank: 1,
        hourlyDeclaredGrossEur: 12,
        heuresParMois: 80,
      },
      taxCredit: { prefundedCesuAnnualEur: 8000 },
    },
  },
];

describe("GARDE-014 integration matrix", () => {
  it.each(MATRIX)("$id : RAC non négatif", ({ id, input }) => {
    const r = computeScenarioSnapshot(pack, input);
    assertNonNegativeRac(r, id);
  });

  it("PreParE plein : CMG nul mais scénario valide", () => {
    const row = MATRIX.find((x) => x.id === "nounou_prepare_full_cumul")!;
    const r = computeScenarioSnapshot(pack, row.input);
    expect(r.snapshot.monthlyCmgEur).toBe(0);
    assertNonNegativeRac(r, row.id);
  });

  it("Micro-crèche inéligible : statut CMG ineligible", () => {
    const row = MATRIX.find((x) => x.id === "micro_creche_ineligible_hourly")!;
    const r = computeScenarioSnapshot(pack, row.input);
    expect(r.snapshot.cmgStatus).toBe("ineligible");
    assertNonNegativeRac(r, row.id);
  });

  it("Crèche publique : CMG unsupported", () => {
    const row = MATRIX.find((x) => x.id === "creche_publique_cmg_unsupported")!;
    const r = computeScenarioSnapshot(pack, row.input);
    expect(r.snapshot.cmgStatus).toBe("unsupported");
    assertNonNegativeRac(r, row.id);
  });

  it("Assmat : routage crédit garde hors domicile", () => {
    const row = MATRIX.find((x) => x.id === "assistante_maternelle_credit_hors_domicile")!;
    const r = computeScenarioSnapshot(pack, row.input);
    expect(r.snapshot.taxCreditKind).toBe("garde_hors_domicile");
    assertNonNegativeRac(r, row.id);
  });

  it("CESU déclaratif + CMG : gate incompatible", () => {
    const g = evaluateCesuDeclaratifVsCmg(pack, {
      receivesCmgOrSimilarChildcareAid: true,
      usesCesuDeclaratifForSameChildcare: true,
    });
    expect(g.compatible).toBe(false);
  });

  it("Préfinancé CESU : crédit annuel ≤ scénario sans préfinancé", () => {
    const base = MATRIX.find((x) => x.id === "nounou_domicile_baseline")!;
    const pref = MATRIX.find((x) => x.id === "nounou_with_prefunded_cesu")!;
    const a = computeScenarioSnapshot(pack, base.input);
    const b = computeScenarioSnapshot(pack, pref.input);
    expect(b.snapshot.annualTaxCreditEur).toBeLessThanOrEqual(a.snapshot.annualTaxCreditEur);
    assertNonNegativeRac(b, pref.id);
  });

  it("Export JSON parseable pour chaque ligne de matrice", () => {
    for (const { id, input } of MATRIX) {
      const result = computeScenarioSnapshot(pack, input);
      const bundle = buildScenarioExportBundle(pack, input, result, { title: id });
      const json = exportScenarioBundleToJson(bundle);
      const parsed = JSON.parse(json) as { result: { snapshot: { mode: string } } };
      expect(parsed.result.snapshot.mode).toBe(input.brutInput.mode);
    }
  });
});
