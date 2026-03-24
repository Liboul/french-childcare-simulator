import { findRule } from "../config/find-rule";
import type { RulePack } from "../config/schema";

/** Paramètres lus depuis `credit-impot-emploi-domicile-plafonds`. */
export type CreditEmploiDomicilePackParams = {
  rate: number;
  standardAnnualExpenseCeilingEur: number;
  incrementPerChildOrSeniorEur: number;
  standardAnnualExpenseCeilingMaxAfterIncrementsEur: number;
};

export function readCreditEmploiDomicileParams(
  pack: RulePack,
): CreditEmploiDomicilePackParams | null {
  const r = findRule(pack, "credit-impot-emploi-domicile-plafonds");
  const p = r?.parameters;
  if (!p || typeof p !== "object") return null;
  return {
    rate: typeof p.rate === "number" ? p.rate : 0.5,
    standardAnnualExpenseCeilingEur:
      typeof p.standardAnnualExpenseCeilingEur === "number"
        ? p.standardAnnualExpenseCeilingEur
        : 12000,
    incrementPerChildOrSeniorEur:
      typeof p.incrementPerChildOrSeniorEur === "number" ? p.incrementPerChildOrSeniorEur : 1500,
    standardAnnualExpenseCeilingMaxAfterIncrementsEur:
      typeof p.standardAnnualExpenseCeilingMaxAfterIncrementsEur === "number"
        ? p.standardAnnualExpenseCeilingMaxAfterIncrementsEur
        : 15000,
  };
}

export type CreditEmploiDomicileAnnual = {
  annualEligibleExpenseEur: number;
  annualCreditEur: number;
  annualCeilingExpenseEur: number;
};

/**
 * Crédit d’impôt emploi à domicile (CGI 199 sexdecies) : 50 % des dépenses dans la limite du plafond annuel.
 * Assiette : coût employeur annuel − CMG annuelle (aligné DR-02 / BOFiP pour la déduction des aides).
 */
export function computeCreditEmploiDomicileAnnual(
  packParams: CreditEmploiDomicilePackParams,
  input: {
    monthlyEmploymentCostEur: number;
    monthlyCmgEur: number;
    childrenCountForCeiling: number;
    custody: "full" | "shared";
  },
): CreditEmploiDomicileAnnual {
  const annualGross = input.monthlyEmploymentCostEur * 12;
  const annualCmg = input.monthlyCmgEur * 12;
  const annualBaseRaw = Math.max(0, annualGross - annualCmg);

  const n = Math.max(0, Math.floor(input.childrenCountForCeiling));
  const incPerChild =
    input.custody === "shared"
      ? Math.round(packParams.incrementPerChildOrSeniorEur * 0.5 * 100) / 100
      : packParams.incrementPerChildOrSeniorEur;
  const rawCeiling = packParams.standardAnnualExpenseCeilingEur + n * incPerChild;
  const annualCeilingExpenseEur = Math.min(
    rawCeiling,
    packParams.standardAnnualExpenseCeilingMaxAfterIncrementsEur,
  );

  const annualEligibleExpenseEur = Math.min(annualBaseRaw, annualCeilingExpenseEur);
  const annualCreditEur = Math.round(packParams.rate * annualEligibleExpenseEur * 100) / 100;

  return { annualEligibleExpenseEur, annualCreditEur, annualCeilingExpenseEur };
}
