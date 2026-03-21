import { findRule } from "../config/find-rule";
import type { RulePack } from "../config/schema";
import type { EmployerCrecheSplitResult } from "./types";

/**
 * Répartition par enfant : partie exonérée (≤ seuil pack / an / enfant) vs avantage en nature imposable (excédent).
 * DR-03 / jurisprudence citée dans la règle (souvent `todoVerify`).
 */
export function splitEmployerCrecheSubsidyAnnualPerChild(
  pack: RulePack,
  annualEmployerContributionEurPerChild: number[],
): EmployerCrecheSplitResult {
  const rule = findRule(pack, "avantage-employeur-creche-seuil-exoneration");
  const ruleIds = ["avantage-employeur-creche-seuil-exoneration"];
  const warnings: string[] = [];

  if (rule?.todoVerify) {
    warnings.push("employer_creche_exemption_rule_marked_todo_verify_in_pack");
  }

  const threshold =
    typeof rule?.parameters?.exemptAnnualAmountPerChildEur === "number"
      ? rule.parameters.exemptAnnualAmountPerChildEur
      : 1830;

  const perChild = annualEmployerContributionEurPerChild.map((amount) => {
    const a = Math.max(0, amount);
    const exempt = Math.min(a, threshold);
    const taxable = Math.max(0, a - threshold);
    return { exemptEur: round2(exempt), taxableFringeEur: round2(taxable) };
  });

  const exemptAnnualTotalEur = round2(perChild.reduce((s, p) => s + p.exemptEur, 0));
  const taxableFringeAnnualTotalEur = round2(perChild.reduce((s, p) => s + p.taxableFringeEur, 0));

  return {
    exemptAnnualTotalEur,
    taxableFringeAnnualTotalEur,
    perChild,
    ruleIds,
    warnings,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
