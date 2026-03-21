import { describe, expect, it } from "vitest";
import rulesFr2026 from "../../config/rules.fr-2026.json" with { type: "json" };
import { parseRulePack } from "../config/parse";
import { describeEmployerPrefundedCesuAnnual } from "../employer-benefits/prefunded-cesu";
import { estimateEmploiDomicileTaxCreditAnnual } from "./emploi-domicile";
import { estimateGardeHorsDomicileTaxCreditAnnual } from "./garde-hors-domicile";
import { taxCreditKindForChildcareMode } from "./types";

const packResult = parseRulePack(rulesFr2026);
if (!packResult.ok) {
  throw new Error(packResult.error);
}
const pack = packResult.data;

const fullChild = (exp: number, cmg = 0, employer = 0) => ({
  annualEligiblePaidExpensesEur: exp,
  annualCmgReceivedEur: cmg,
  annualEmployerAidDeductibleFromBaseEur: employer,
  sharedCustodyHalvedCeiling: false,
  qualifiesAgeAndCharge: true,
});

describe("estimateGardeHorsDomicileTaxCreditAnnual", () => {
  it("4 000 € sans aides, garde complète → base 3 500 €, crédit 1 750 €", () => {
    const r = estimateGardeHorsDomicileTaxCreditAnnual(pack, [fullChild(4000)]);
    expect(r.perChild[0]!.netBaseBeforeCapEur).toBe(4000);
    expect(r.perChild[0]!.cappedBaseEur).toBe(3500);
    expect(r.perChild[0]!.creditEur).toBe(1750);
    expect(r.totalCreditEur).toBe(1750);
    expect(r.ruleIds).toContain("credit-impot-garde-hors-domicile");
  });

  it("4 000 € avec 800 € CMG déduite → crédit 1 600 €", () => {
    const r = estimateGardeHorsDomicileTaxCreditAnnual(pack, [fullChild(4000, 800)]);
    expect(r.perChild[0]!.netBaseBeforeCapEur).toBe(3200);
    expect(r.perChild[0]!.cappedBaseEur).toBe(3200);
    expect(r.perChild[0]!.creditEur).toBe(1600);
  });

  it("résidence alternée → plafond 1 750 €, crédit 875 €", () => {
    const r = estimateGardeHorsDomicileTaxCreditAnnual(pack, [
      {
        ...fullChild(4000),
        sharedCustodyHalvedCeiling: true,
      },
    ]);
    expect(r.perChild[0]!.cappedBaseEur).toBe(1750);
    expect(r.perChild[0]!.creditEur).toBe(875);
  });

  it("enfant non éligible → crédit nul", () => {
    const r = estimateGardeHorsDomicileTaxCreditAnnual(pack, [
      { ...fullChild(4000), qualifiesAgeAndCharge: false },
    ]);
    expect(r.perChild[0]!.creditEur).toBe(0);
    expect(r.totalCreditEur).toBe(0);
  });
});

describe("estimateEmploiDomicileTaxCreditAnnual", () => {
  it("20 000 €, 1 enfant, 1 000 € préfinancé → plafond 13 500 €, crédit 6 750 €", () => {
    const r = estimateEmploiDomicileTaxCreditAnnual(pack, {
      annualQualifyingExpensesEur: 20000,
      taxUnitDependentChildrenCount: 1,
      prefundedCesuAnnualEur: 1000,
      sharedCustodyHalvedIncrements: false,
    });
    expect(r.expenseCeilingEur).toBe(13500);
    expect(r.netBaseBeforeCapEur).toBe(19000);
    expect(r.cappedBaseEur).toBe(13500);
    expect(r.creditEur).toBe(6750);
    expect(r.ruleIds).toContain("credit-impot-emploi-domicile-plafonds");
  });

  it("aligne le préfinancé avec describeEmployerPrefundedCesuAnnual", () => {
    const pref = describeEmployerPrefundedCesuAnnual(pack, 1000);
    const r = estimateEmploiDomicileTaxCreditAnnual(pack, {
      annualQualifyingExpensesEur: 20000,
      taxUnitDependentChildrenCount: 1,
      prefundedCesuAnnualEur: pref.annualAmountEur,
      sharedCustodyHalvedIncrements: false,
    });
    expect(r.creditEur).toBe(6750);
  });
});

describe("taxCreditKindForChildcareMode", () => {
  it("routage hors domicile vs emploi à domicile", () => {
    expect(taxCreditKindForChildcareMode("nounou_domicile")).toBe("emploi_domicile");
    expect(taxCreditKindForChildcareMode("assistante_maternelle")).toBe("garde_hors_domicile");
    expect(taxCreditKindForChildcareMode("creche_privee")).toBe("garde_hors_domicile");
  });
});
