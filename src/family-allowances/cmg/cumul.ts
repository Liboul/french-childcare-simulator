import { findRule } from "../../config/find-rule";
import type { RulePack } from "../../config/schema";
import type { CmgCumulInput } from "./types";

/**
 * Applique PreParE (non-cumul / divisé par 2) puis majoration AAH/AEEH (× ratio pack).
 * Ordre : taux plein → 0 ; sinon partiel → /2 ; puis ×1,3 si AAH/AEEH.
 */
export function applyCmgCumulFromPack(
  pack: RulePack,
  baseMonthlyCmgEur: number,
  cumul: CmgCumulInput,
): { amountEur: number; ruleIds: string[] } {
  const rule = findRule(pack, "cmg-non-cumul-et-majorations");
  const ruleIds = rule ? ["cmg-non-cumul-et-majorations"] : [];
  if (!rule?.parameters?.interactions) {
    return { amountEur: baseMonthlyCmgEur, ruleIds };
  }

  let x = baseMonthlyCmgEur;
  if (cumul.receivesPrepareFull) {
    return { amountEur: 0, ruleIds };
  }
  if (cumul.receivesPreparePartial) {
    x = x / 2;
  }
  if (cumul.receivesAahOrAeeh) {
    const interactions = rule.parameters.interactions as Array<{
      otherBenefit?: string;
      effect?: string;
      ratio?: number;
    }>;
    const row = interactions.find((i) => i.otherBenefit === "aah_or_aeeh");
    const ratio = typeof row?.ratio === "number" ? row.ratio : 1.3;
    x = x * ratio;
  }
  return { amountEur: roundMoney2(Math.max(0, x)), ruleIds };
}

function roundMoney2(n: number): number {
  return Math.round(n * 100) / 100;
}
