import { findRule } from "../config/find-rule";
import type { RulePack } from "../config/schema";
import type { PrefundedCesuDescription } from "./types";

/**
 * Documente l’impact fiscal du CESU préfinancé employeur (assiette crédit impôt), sans calculer le crédit (GARDE-009).
 */
export function describeEmployerPrefundedCesuAnnual(
  pack: RulePack,
  annualAmountEur: number,
): PrefundedCesuDescription {
  const rule = findRule(pack, "cesu-cmg-non-cumul");
  const ruleIds = rule ? ["cesu-cmg-non-cumul"] : [];
  const warnings: string[] = [];
  if (!rule) {
    warnings.push("cesu_prefunded_rule_missing_in_pack");
  }
  return {
    annualAmountEur: Math.max(0, annualAmountEur),
    reducesEmploymentTaxCreditBase: true,
    ruleIds,
    warnings,
  };
}
