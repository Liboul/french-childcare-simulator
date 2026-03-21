import { findRule } from "../config/find-rule";
import type { RulePack } from "../config/schema";
import type { GardeHorsDomicileChildInput, GardeHorsDomicileTaxCreditResult } from "./types";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Crédit d’impôt pour frais de garde **hors du domicile** (CGI art. 200 quater B, paramètres pack).
 * DR-02 : assiette = dépenses − CMG − aides employeur (selon drapeaux du pack).
 */
export function estimateGardeHorsDomicileTaxCreditAnnual(
  pack: RulePack,
  children: GardeHorsDomicileChildInput[],
): GardeHorsDomicileTaxCreditResult {
  const rule = findRule(pack, "credit-impot-garde-hors-domicile");
  const ruleIds = rule ? ["credit-impot-garde-hors-domicile"] : [];
  const warnings: string[] = [];

  if (!rule) {
    warnings.push("credit_garde_hors_domicile_rule_missing_in_pack");
  }

  const p = rule?.parameters ?? {};
  const rate = typeof p.rate === "number" ? p.rate : 0.5;
  const maxExpFull =
    typeof p.maxEligibleExpensePerChildFullCustodyEur === "number"
      ? p.maxEligibleExpensePerChildFullCustodyEur
      : 3500;
  const maxExpShared =
    typeof p.maxEligibleExpensePerChildSharedCustodyEur === "number"
      ? p.maxEligibleExpensePerChildSharedCustodyEur
      : 1750;
  const maxCredFull =
    typeof p.maxCreditPerChildFullCustodyEur === "number"
      ? p.maxCreditPerChildFullCustodyEur
      : 1750;
  const maxCredShared =
    typeof p.maxCreditPerChildSharedCustodyEur === "number"
      ? p.maxCreditPerChildSharedCustodyEur
      : 875;
  const deductCmg = p.deductCmgFromBase !== false;
  const deductEmployer = p.deductEmployerAidFromBase !== false;

  const perChild = children.map((c) => {
    if (!c.qualifiesAgeAndCharge) {
      return {
        netBaseBeforeCapEur: 0,
        cappedBaseEur: 0,
        creditEur: 0,
      };
    }

    let net = Math.max(0, c.annualEligiblePaidExpensesEur);
    if (deductCmg) net = Math.max(0, net - Math.max(0, c.annualCmgReceivedEur));
    if (deductEmployer)
      net = Math.max(0, net - Math.max(0, c.annualEmployerAidDeductibleFromBaseEur));

    const capExp = c.sharedCustodyHalvedCeiling ? maxExpShared : maxExpFull;
    const capCred = c.sharedCustodyHalvedCeiling ? maxCredShared : maxCredFull;
    const cappedBase = Math.min(net, capExp);
    const credit = Math.min(round2(cappedBase * rate), capCred);

    return {
      netBaseBeforeCapEur: round2(net),
      cappedBaseEur: round2(cappedBase),
      creditEur: round2(credit),
    };
  });

  const totalCreditEur = round2(perChild.reduce((s, row) => s + row.creditEur, 0));

  return { perChild, totalCreditEur, ruleIds, warnings };
}
