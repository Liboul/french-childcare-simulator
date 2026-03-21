import { findRule } from "../config/find-rule";
import type { RulePack } from "../config/schema";
import type { PrefundedCesuDescription } from "./types";

/** Plafond légal annuel (par bénéficiaire) de l'aide en CESU préfinancé — paramètre `config/rules.*.json` règle `cesu-prefinance-plafond-aide-financiere-employeur`. */
export const CESU_PREFINANCE_EMPLOYER_AID_CAP_RULE_ID =
  "cesu-prefinance-plafond-aide-financiere-employeur" as const;

/**
 * Avertissements si le montant saisi dépasse le plafond pack (2540 € depuis le 01/01/2025).
 * Ne tronque pas la saisie : le crédit d'impôt utilise encore le montant déclaré.
 */
export function cesuPrefundedAmountWarnings(
  pack: RulePack,
  annualAmountEur: number,
): { warnings: string[]; ruleIds: string[] } {
  const pref = Math.max(0, annualAmountEur);
  if (pref <= 0) {
    return { warnings: [], ruleIds: [] };
  }
  const capRule = findRule(pack, CESU_PREFINANCE_EMPLOYER_AID_CAP_RULE_ID);
  if (!capRule) {
    return { warnings: ["cesu_prefinance_cap_rule_missing_in_pack"], ruleIds: [] };
  }
  const capRaw = capRule.parameters?.maxAnnualAidPerBeneficiaryEur;
  const cap = typeof capRaw === "number" && capRaw > 0 ? capRaw : null;
  const ruleIds = [CESU_PREFINANCE_EMPLOYER_AID_CAP_RULE_ID];
  if (cap == null) {
    return { warnings: ["cesu_prefinance_cap_parameter_invalid_in_pack"], ruleIds };
  }
  if (pref > cap) {
    return { warnings: ["cesu_prefunded_exceeds_employer_aid_annual_cap"], ruleIds };
  }
  return { warnings: [], ruleIds };
}

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
  const cap = cesuPrefundedAmountWarnings(pack, annualAmountEur);
  warnings.push(...cap.warnings);
  const mergedRuleIds = [...new Set([...ruleIds, ...cap.ruleIds])];
  return {
    annualAmountEur: Math.max(0, annualAmountEur),
    reducesEmploymentTaxCreditBase: true,
    ruleIds: mergedRuleIds,
    warnings,
  };
}
