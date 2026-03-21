import { findRule } from "../config/find-rule";
import type { RulePack } from "../config/schema";
import { cesuPrefundedAmountWarnings } from "../employer-benefits/prefunded-cesu";
import type { EmploiDomicileTaxCreditInput, EmploiDomicileTaxCreditResult } from "./types";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Crédit d’impôt **emploi à domicile** (CGI art. 199 sexdecies) : 50 % de l’assiette dans la limite du plafond pack.
 * Le CESU **préfinancé** employeur réduit l’assiette (DR-03 / 7DR), comme documenté en GARDE-008.
 */
export function estimateEmploiDomicileTaxCreditAnnual(
  pack: RulePack,
  input: EmploiDomicileTaxCreditInput,
): EmploiDomicileTaxCreditResult {
  const rule = findRule(pack, "credit-impot-emploi-domicile-plafonds");
  let ruleIds = rule ? ["credit-impot-emploi-domicile-plafonds"] : [];
  const warnings: string[] = [];

  if (!rule) {
    warnings.push("credit_emploi_domicile_rule_missing_in_pack");
  }

  const capCheck = cesuPrefundedAmountWarnings(pack, input.prefundedCesuAnnualEur);
  warnings.push(...capCheck.warnings);
  ruleIds = [...new Set([...ruleIds, ...capCheck.ruleIds])];

  const p = rule?.parameters ?? {};
  const rate = typeof p.rate === "number" ? p.rate : 0.5;
  const standard =
    typeof p.standardAnnualExpenseCeilingEur === "number"
      ? p.standardAnnualExpenseCeilingEur
      : 12000;
  const incrementFull =
    typeof p.incrementPerChildOrSeniorEur === "number" ? p.incrementPerChildOrSeniorEur : 1500;
  const maxAfterInc =
    typeof p.standardAnnualExpenseCeilingMaxAfterIncrementsEur === "number"
      ? p.standardAnnualExpenseCeilingMaxAfterIncrementsEur
      : 15000;

  const n = Math.max(0, Math.floor(input.taxUnitDependentChildrenCount));
  const incPerChild = input.sharedCustodyHalvedIncrements ? incrementFull / 2 : incrementFull;
  const expenseCeilingEur = Math.min(standard + incPerChild * n, maxAfterInc);

  const gross = Math.max(0, input.annualQualifyingExpensesEur);
  const pref = Math.max(0, input.prefundedCesuAnnualEur);
  const netBaseBeforeCapEur = round2(Math.max(0, gross - pref));
  const cappedBaseEur = round2(Math.min(netBaseBeforeCapEur, expenseCeilingEur));
  const creditEur = round2(cappedBaseEur * rate);

  return {
    netBaseBeforeCapEur,
    expenseCeilingEur: round2(expenseCeilingEur),
    cappedBaseEur,
    creditEur,
    ruleIds,
    warnings,
  };
}
