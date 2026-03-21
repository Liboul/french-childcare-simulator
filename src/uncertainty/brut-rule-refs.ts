import type { BrutCostInput } from "../childcare/model";

const GARDE_PARTAGEE_RULE_ID = "garde-partagee-majoration-simultanes-dr04";

/** Règles pack potentiellement lues par `computeBrutMonthlyCost` selon le mode. */
export function brutInputReferencedRuleIds(input: BrutCostInput): string[] {
  if (input.mode === "nounou_partagee") {
    return [GARDE_PARTAGEE_RULE_ID];
  }
  return [];
}
