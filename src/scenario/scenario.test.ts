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
  it("nounou à domicile partagée : brut divisé + avertissement alignement CMG", () => {
    const exclusive = computeScenarioSnapshot(pack, {
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
    const shared = computeScenarioSnapshot(pack, {
      household: household2026,
      brutInput: {
        mode: "nounou_domicile",
        hourlyGrossEur: 12,
        hoursPerMonth: 80,
        employerShareOfGross: 0.42,
        householdShareOfEmploymentCost: 0.5,
      },
      cmg: {
        cumul: {},
        monthlyReferenceIncomeEur: 4000,
        householdEffortRank: 1,
        hourlyDeclaredGrossEur: 12,
        heuresParMois: 40,
      },
    });
    expect(shared.snapshot.monthlyBrutEur).toBeCloseTo(exclusive.snapshot.monthlyBrutEur / 2, 4);
    expect(shared.warnings).toContain(
      "nounou_domicile_shared_employment_align_cmg_with_household_declaration_to_caf",
    );
  });

  it("nounou à domicile + DR-06 : brut total > assiette CI si postes exclus", () => {
    const base = computeScenarioSnapshot(pack, {
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
    const withExtras = computeScenarioSnapshot(pack, {
      household: household2026,
      brutInput: {
        mode: "nounou_domicile",
        hourlyGrossEur: 12,
        hoursPerMonth: 80,
        employerShareOfGross: 0.42,
        domicileComplementaryCosts: {
          provisionCongesPayesMensuelEur: 50,
          depensesHorsCreditImpotLisseesMensuelEur: 200,
        },
      },
      cmg: {
        cumul: {},
        monthlyReferenceIncomeEur: 4000,
        householdEffortRank: 1,
        hourlyDeclaredGrossEur: 12,
        heuresParMois: 80,
      },
    });
    expect(withExtras.snapshot.monthlyBrutEur).toBeGreaterThan(base.snapshot.monthlyBrutEur);
    expect(withExtras.snapshot.monthlyBrutTaxCreditAssietteEur).toBe(base.snapshot.monthlyBrutEur);
    expect(withExtras.snapshot.annualTaxCreditEur).toBe(base.snapshot.annualTaxCreditEur);
    expect(withExtras.warnings).toContain("domicile_provision_cp_fiscal_timing_dr06");
    expect(withExtras.warnings).toContain(
      "domicile_excluded_from_tax_credit_included_in_brut_dr06",
    );
  });

  it("Navigo déclaré sans montant mensuel → warning consultation tarif IDFM", () => {
    const r = computeScenarioSnapshot(pack, {
      household: household2026,
      brutInput: {
        mode: "nounou_domicile",
        hourlyGrossEur: 12,
        hoursPerMonth: 80,
        employerShareOfGross: 0.42,
        domicileComplementaryCosts: {
          fraisTransportBase: "navigo_mois_plein",
        },
      },
      cmg: {
        cumul: {},
        monthlyReferenceIncomeEur: 4000,
        householdEffortRank: 1,
        hourlyDeclaredGrossEur: 12,
        heuresParMois: 80,
      },
    });
    expect(r.warnings).toContain(
      "domicile_transport_navigo_or_forfait_missing_monthly_eur_consult_iledefrance_mobilites",
    );
  });

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
    expect(r.snapshot.monthlyBrutTaxCreditAssietteEur).toBe(r.snapshot.monthlyBrutEur);
    expect(r.snapshot.annualBrutTaxCreditAssietteEur).toBe(r.snapshot.annualBrutEur);
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

  it("sans incomeTax : champs IR absents (null)", () => {
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
    expect(r.snapshot.estimatedIncomeTaxGrossAnnualEur).toBeNull();
    expect(r.snapshot.marginalIncomeTaxRate).toBeNull();
    expect(r.snapshot.householdGrossSalaryAnnualEur).toBeNull();
    expect(r.snapshot.householdNetSalaryAnnualEur).toBeNull();
    expect(r.snapshot.householdIncomeAfterIncomeTaxAnnualEur).toBeNull();
  });

  it("incomeTax (RNI) : snapshot IR + limitation QF", () => {
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
      incomeTax: {
        annualNetTaxableIncomeEur: 30_000,
        householdTaxParts: 1,
        filing: "individual",
      },
    });
    expect(r.snapshot.estimatedIncomeTaxGrossAnnualEur).toBe(2103.99);
    expect(r.snapshot.marginalIncomeTaxRate).toBe(0.3);
    expect(r.limitationHints.map((h) => h.code)).toContain(
      "income_tax_quotient_familial_plafond_non_modele",
    );
  });

  it("annualHouseholdIncomeAfterIncomeTaxEur seul : disponible = après IR /12 − RAC", () => {
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
      incomeTax: { annualHouseholdIncomeAfterIncomeTaxEur: 48_000 },
    });
    expect(r.snapshot.estimatedIncomeTaxGrossAnnualEur).toBeNull();
    expect(r.snapshot.householdGrossSalaryAnnualEur).toBeNull();
    expect(r.snapshot.householdNetSalaryAnnualEur).toBeNull();
    expect(r.snapshot.householdIncomeAfterIncomeTaxAnnualEur).toBe(48_000);
    expect(r.snapshot.householdIncomeAfterIncomeTaxMonthlyEur).toBe(4000);
    expect(r.snapshot.disposableIncomeMonthlyEur).toBe(
      Math.round((4000 - r.snapshot.netHouseholdBurdenMonthlyEur) * 100) / 100,
    );
  });

  it("incomeTax brut + net bulletin : snapshot reprend les montants foyer (÷12)", () => {
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
      incomeTax: {
        annualGrossSalaryEur: 60_000,
        annualNetSalaryFromPayslipsEur: 45_000,
        householdTaxParts: 2,
        filing: "joint",
      },
    });
    expect(r.snapshot.householdGrossSalaryAnnualEur).toBe(60_000);
    expect(r.snapshot.householdGrossSalaryMonthlyEur).toBe(5000);
    expect(r.snapshot.householdNetSalaryAnnualEur).toBe(45_000);
    expect(r.snapshot.householdNetSalaryMonthlyEur).toBe(3750);
    expect(r.snapshot.householdIncomeAfterIncomeTaxAnnualEur).toBeNull();
  });

  it("baseline + incomeTax : IR mensuel estimé déduit (warning PAS)", () => {
    const base = computeScenarioSnapshot(pack, {
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
      incomeTax: {
        annualNetTaxableIncomeEur: 30_000,
        householdTaxParts: 1,
        filing: "individual",
      },
    });
    const irM = Math.round((2103.99 / 12) * 100) / 100;
    expect(r.snapshot.disposableIncomeMonthlyEur).toBe(
      Math.round((5000 - irM - r.snapshot.netHouseholdBurdenMonthlyEur) * 100) / 100,
    );
    expect(r.snapshot.disposableIncomeMonthlyEur).toBeLessThan(
      base.snapshot.disposableIncomeMonthlyEur!,
    );
    expect(r.warnings).toContain(
      "income_tax_subtracted_from_baseline_verify_not_double_with_pas_dr07",
    );
  });
});
