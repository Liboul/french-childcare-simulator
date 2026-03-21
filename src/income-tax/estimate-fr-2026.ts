import type { IncomeTaxBaremeFr2026 } from "./bareme-fr-2026";
import { incomeTaxBaremeFr2026 } from "./bareme-fr-2026";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** RNI salarial via abattement forfaitaire 10 % (min / max), DR-07 § 3.5. */
export function annualNetTaxableFromGrossSalaryEur(
  grossAnnualEur: number,
  bareme: IncomeTaxBaremeFr2026,
): number {
  const { rate, minimumEur, maximumEur } = bareme.salaryAbattement;
  const abattement = Math.min(Math.max(grossAnnualEur * rate, minimumEur), maximumEur);
  return round2(Math.max(0, grossAnnualEur - abattement));
}

export type FrenchIncomeTaxEstimate2026 = {
  annualNetTaxableIncomeEur: number;
  quotientEur: number;
  taxPerPartBeforeDecoteEur: number;
  incomeTaxGrossAnnualEur: number;
  decoteAnnualEur: number;
  incomeTaxNetAfterDecoteAnnualEur: number;
  marginalIncomeTaxRate: number;
  warnings: string[];
};

function taxPerPartAndMarginalRate(
  quotient: number,
  bareme: IncomeTaxBaremeFr2026,
): { taxPerPart: number; marginalRate: number } {
  let taxPerPart = 0;
  let marginalRate = 0;
  for (const s of bareme.quotientSlices) {
    if (quotient <= s.taxableFromExclusive) continue;
    const cap = s.taxableToInclusive == null ? quotient : Math.min(quotient, s.taxableToInclusive);
    const sliceWidth = cap - s.taxableFromExclusive;
    if (sliceWidth > 0) {
      taxPerPart += sliceWidth * s.rate;
      marginalRate = s.rate;
    }
  }
  return { taxPerPart: round2(taxPerPart), marginalRate };
}

/**
 * Estimation IR foyer (barème 2026 / revenus 2025), hors plafonnement QF et hors crédits d’impôt.
 * @see docs/research/DR-07-IR-TMI-DISPONIBLE.md
 */
export function estimateFrenchIncomeTax2026(args: {
  annualNetTaxableIncomeEur: number;
  householdTaxParts: number;
  filing: "individual" | "joint";
  bareme?: IncomeTaxBaremeFr2026;
}): FrenchIncomeTaxEstimate2026 {
  const bareme = args.bareme ?? incomeTaxBaremeFr2026;
  const warnings: string[] = ["income_tax_estimate_simplified_no_qf_plafond_no_credits"];
  const parts = args.householdTaxParts;
  const rni = round2(Math.max(0, args.annualNetTaxableIncomeEur));
  const quotientEur = round2(rni / parts);
  const { taxPerPart, marginalRate } = taxPerPartAndMarginalRate(quotientEur, bareme);
  const incomeTaxGrossAnnualEur = round2(taxPerPart * parts);

  const decoteCfg = args.filing === "joint" ? bareme.decote.joint : bareme.decote.individual;
  let decoteAnnualEur = 0;
  if (incomeTaxGrossAnnualEur < decoteCfg.thresholdImpotBrutEur) {
    decoteAnnualEur = round2(
      Math.max(0, decoteCfg.constantEur - decoteCfg.coefficient * incomeTaxGrossAnnualEur),
    );
    warnings.push("income_tax_decote_zone_tmi_nonlinear_dr07");
  }

  const incomeTaxNetAfterDecoteAnnualEur = round2(
    Math.max(0, incomeTaxGrossAnnualEur - decoteAnnualEur),
  );

  return {
    annualNetTaxableIncomeEur: rni,
    quotientEur,
    taxPerPartBeforeDecoteEur: taxPerPart,
    incomeTaxGrossAnnualEur,
    decoteAnnualEur,
    incomeTaxNetAfterDecoteAnnualEur,
    marginalIncomeTaxRate: marginalRate,
    warnings,
  };
}
