import { findRule } from "../config/find-rule";
import type { RulePack } from "../config/schema";
import type { CesuCmgGateInput, CesuCmgGateResult } from "./types";

/**
 * Non-cumul CESU déclaratif × aide CAF/MSA garde (DR-03, règle qualitative dans le pack).
 */
export function evaluateCesuDeclaratifVsCmg(
  pack: RulePack,
  input: CesuCmgGateInput,
): CesuCmgGateResult {
  const rule = findRule(pack, "cesu-cmg-non-cumul");
  const ruleIds = rule ? ["cesu-cmg-non-cumul"] : [];

  if (input.receivesCmgOrSimilarChildcareAid && input.usesCesuDeclaratifForSameChildcare) {
    return {
      compatible: false,
      messageKey: "cesu_cmg_non_cumul_dr03",
      ruleIds,
    };
  }

  return {
    compatible: true,
    messageKey: "cesu_cmg_ok",
    ruleIds,
  };
}
