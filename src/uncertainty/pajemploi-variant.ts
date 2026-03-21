import { findRule } from "../config/find-rule";
import type { RulePack } from "../config/schema";
import type { PajemploiRateVariant, PajemploiRatesResult } from "./types";

const RULE_ID = "cotisations-pajemploi-taux-indicatifs-dr03-dr04";

/**
 * Taux **indicatifs** Pajemploi / particulier employeur : le pack expose DR-03 et DR-04 ;
 * l’appelant doit choisir explicitement la variante (politique « pas de défaut silencieux »).
 */
export function readPajemploiIndicativeRates(
  pack: RulePack,
  variant: PajemploiRateVariant,
): PajemploiRatesResult {
  const rule = findRule(pack, RULE_ID);
  if (!rule) {
    return {
      ok: false,
      warnings: ["pajemploi_indicative_rates_rule_missing_in_pack"],
    };
  }

  const block = rule.parameters?.[variant];
  const employer =
    block && typeof block === "object" && "employerShareOfGrossApprox" in block
      ? (block as { employerShareOfGrossApprox?: unknown }).employerShareOfGrossApprox
      : undefined;
  const employee =
    block && typeof block === "object" && "employeeShareOfGrossApprox" in block
      ? (block as { employeeShareOfGrossApprox?: unknown }).employeeShareOfGrossApprox
      : undefined;

  if (typeof employer !== "number" || typeof employee !== "number") {
    return {
      ok: false,
      warnings: [
        "pajemploi_indicative_rates_variant_block_invalid",
        `pajemploi_variant_requested:${variant}`,
      ],
    };
  }

  const warnings: string[] = [
    "pajemploi_rates_are_indicative_not_urssaf_official",
    `pajemploi_variant_explicitly_selected:${variant}`,
  ];
  if (rule.todoVerify) {
    warnings.push("pajemploi_indicative_rates_rule_marked_todo_verify_in_pack");
  }

  return {
    ok: true,
    variant,
    employerShareOfGrossApprox: employer,
    employeeShareOfGrossApprox: employee,
    ruleIds: [RULE_ID],
    warnings,
  };
}
