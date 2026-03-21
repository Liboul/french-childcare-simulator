import { describe, expect, it } from "vitest";
import rulesFr2026 from "../../config/rules.fr-2026.json" with { type: "json" };
import { parseRulePack } from "../config/parse";
import { computeScenarioSnapshot } from "./aggregate";

const packResult = parseRulePack(rulesFr2026);
if (!packResult.ok) {
  throw new Error(packResult.error);
}
const pack = packResult.data;

const household2026 = { taxYear: 2026 };

describe("computeScenarioSnapshot", () => {
  it("nounou à domicile : reste à charge annuel < brut annuel (CMG + crédit emploi)", () => {
    const r = computeScenarioSnapshot(pack, {
      household: household2026,
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
    });
    expect(r.snapshot.cmgStatus).toBe("ok");
    expect(r.snapshot.taxCreditKind).toBe("emploi_domicile");
    expect(r.snapshot.annualTaxCreditEur).toBeGreaterThan(0);
    expect(r.snapshot.netHouseholdBurdenAnnualEur).toBeLessThan(r.snapshot.annualBrutEur);
    expect(r.trace.steps).toHaveLength(4);
  });

  it("micro-crèche : crédit garde hors domicile + agrégation", () => {
    const r = computeScenarioSnapshot(pack, {
      household: household2026,
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
    });
    expect(r.snapshot.cmgStatus).toBe("ok");
    expect(r.snapshot.taxCreditKind).toBe("garde_hors_domicile");
    expect(r.snapshot.monthlyCmgEur).toBe(850);
    expect(r.snapshot.netHouseholdBurdenAnnualEur).toBeLessThan(r.snapshot.annualBrutEur);
  });

  it("baseline disponible : revenu moins reste à charge mensuel", () => {
    const r = computeScenarioSnapshot(pack, {
      household: household2026,
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
      baselineDisposableIncomeMonthlyEur: 5000,
    });
    expect(r.snapshot.disposableIncomeMonthlyEur).toBe(
      Math.round((5000 - r.snapshot.netHouseholdBurdenMonthlyEur) * 100) / 100,
    );
  });

  it("écart soutien employeur vs référence → avertissement", () => {
    const r = computeScenarioSnapshot(pack, {
      household: household2026,
      brutInput: { mode: "creche_privee", monthlyParticipationEur: 800 },
      cmg: {
        cumul: {},
        annualReferenceIncomeN2Eur: 20_000,
        structureDependentChildren: 1,
        childAgeBand: "under3",
        monthlyStructureExpenseEur: 800,
        hourlyCrecheFeeEur: 9,
      },
      declaredEmployerChildcareSupportAnnualEur: 2000,
      referenceEmployerChildcareSupportAnnualEur: 1500,
    });
    expect(r.snapshot.employerSupportDeltaAnnualEur).toBe(500);
    expect(r.warnings).toContain("employer_childcare_support_differs_from_reference_scenario");
  });

  it("soutien employeur aligné sur la référence → pas d’avertissement d’écart", () => {
    const r = computeScenarioSnapshot(pack, {
      household: household2026,
      brutInput: { mode: "creche_privee", monthlyParticipationEur: 800 },
      cmg: {
        cumul: {},
        annualReferenceIncomeN2Eur: 20_000,
        structureDependentChildren: 1,
        childAgeBand: "under3",
        monthlyStructureExpenseEur: 800,
        hourlyCrecheFeeEur: 9,
      },
      declaredEmployerChildcareSupportAnnualEur: 1500,
      referenceEmployerChildcareSupportAnnualEur: 1500,
    });
    expect(r.snapshot.employerSupportDeltaAnnualEur).toBe(0);
    expect(r.warnings).not.toContain("employer_childcare_support_differs_from_reference_scenario");
  });
});
