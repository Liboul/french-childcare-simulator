import { findRule } from "../config/find-rule";
import type { RulePack } from "../config/schema";

/** Paramètres lus depuis `credit-impot-garde-hors-domicile` dans le pack. */
export type CreditGardeHorsDomicilePackParams = {
  rate: number;
  maxEligibleExpensePerChildFullCustodyEur: number;
  maxCreditPerChildFullCustodyEur: number;
  maxEligibleExpensePerChildSharedCustodyEur: number;
  maxCreditPerChildSharedCustodyEur: number;
  deductCmgFromBase: boolean;
};

export function readCreditGardeHorsDomicileParams(
  pack: RulePack,
): CreditGardeHorsDomicilePackParams | null {
  const r = findRule(pack, "credit-impot-garde-hors-domicile");
  const p = r?.parameters;
  if (!p || typeof p !== "object") return null;
  const rate = typeof p.rate === "number" ? p.rate : 0.5;
  const maxEligibleExpensePerChildFullCustodyEur =
    typeof p.maxEligibleExpensePerChildFullCustodyEur === "number"
      ? p.maxEligibleExpensePerChildFullCustodyEur
      : 3500;
  const maxCreditPerChildFullCustodyEur =
    typeof p.maxCreditPerChildFullCustodyEur === "number"
      ? p.maxCreditPerChildFullCustodyEur
      : 1750;
  const maxEligibleExpensePerChildSharedCustodyEur =
    typeof p.maxEligibleExpensePerChildSharedCustodyEur === "number"
      ? p.maxEligibleExpensePerChildSharedCustodyEur
      : 1750;
  const maxCreditPerChildSharedCustodyEur =
    typeof p.maxCreditPerChildSharedCustodyEur === "number"
      ? p.maxCreditPerChildSharedCustodyEur
      : 875;
  const deductCmgFromBase = p.deductCmgFromBase === true;
  return {
    rate,
    maxEligibleExpensePerChildFullCustodyEur,
    maxCreditPerChildFullCustodyEur,
    maxEligibleExpensePerChildSharedCustodyEur,
    maxCreditPerChildSharedCustodyEur,
    deductCmgFromBase,
  };
}

export type CreditGardeHorsDomicileAnnual = {
  annualEligibleExpenseEur: number;
  annualCreditEur: number;
};

/**
 * Crédit d'impôt « garde hors domicile » (CGI 200 quater B, paramètres pack).
 * `monthlyParticipationEur` = part facturée au foyer ; `monthlyCmgEur` = CMG structure (mensuel) si ventilée.
 */
export function computeCreditGardeHorsDomicileAnnual(
  packParams: CreditGardeHorsDomicilePackParams,
  input: {
    monthlyParticipationEur: number;
    monthlyCmgEur: number;
    childrenCount: number;
    custody: "full" | "shared";
  },
): CreditGardeHorsDomicileAnnual {
  const { monthlyParticipationEur, monthlyCmgEur, childrenCount, custody } = input;
  const annualParticipation = monthlyParticipationEur * 12;
  const annualCmg = monthlyCmgEur * 12;
  const annualBaseRaw = packParams.deductCmgFromBase
    ? Math.max(0, annualParticipation - annualCmg)
    : annualParticipation;

  const maxEligiblePerChild =
    custody === "full"
      ? packParams.maxEligibleExpensePerChildFullCustodyEur
      : packParams.maxEligibleExpensePerChildSharedCustodyEur;
  const maxCreditPerChild =
    custody === "full"
      ? packParams.maxCreditPerChildFullCustodyEur
      : packParams.maxCreditPerChildSharedCustodyEur;

  const eligibleCap = maxEligiblePerChild * childrenCount;
  const annualEligibleExpenseEur = Math.min(annualBaseRaw, eligibleCap);
  const annualCreditUncapped = packParams.rate * annualEligibleExpenseEur;
  const annualCreditEur = Math.min(annualCreditUncapped, maxCreditPerChild * childrenCount);

  return { annualEligibleExpenseEur, annualCreditEur };
}
