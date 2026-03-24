import { findRule } from "../config/find-rule";
import type { RulePack } from "../config/schema";

const RULE_ID = "cmg-emploi-direct-assistante-maternelle-2026-04";

/** Effort rate row from the pack (DR-01 : taux en fraction du revenu mensuel). */
type EffortRow = { minRank: number; maxRank: number | null; effortRate: number };

function pickEffortRate(rows: EffortRow[] | undefined, childRank: number): number {
  if (!rows?.length) return 0.000619;
  const r = Math.max(1, Math.floor(childRank));
  for (const row of rows) {
    const max = row.maxRank ?? 999;
    if (r >= row.minRank && r <= max) return row.effortRate;
  }
  return rows[rows.length - 1]?.effortRate ?? 0.000413;
}

export type CmgAssmatComputed = {
  monthlyCmgEur: number;
  boundedIncomeEur: number;
  effortRate: number;
  ratioParentEffort: number;
  formulaNote: string;
};

/**
 * CMG emploi direct — assistante maternelle (formule pack, alignée DR-01 §4).
 * CMG = coût_garde × (1 − (revenu_borné × taux_effort / CHR)).
 */
export function computeCmgAssmatEmploiDirectMonthly(
  pack: RulePack,
  input: {
    monthlyHouseholdIncomeEur: number;
    monthlyCostOfCareEur: number;
    householdChildRank: number;
  },
): CmgAssmatComputed | null {
  const rule = findRule(pack, RULE_ID);
  const p = rule?.parameters;
  if (!p || typeof p !== "object") return null;

  const chr = typeof p.hourlyReferenceCostEur === "number" ? p.hourlyReferenceCostEur : 4.85;
  const floor = typeof p.incomeFloorMonthlyEur === "number" ? p.incomeFloorMonthlyEur : 814.62;
  const ceiling = typeof p.incomeCeilingMonthlyEur === "number" ? p.incomeCeilingMonthlyEur : 8500;
  const rows = p.effortRateByHouseholdChildRank as EffortRow[] | undefined;

  const boundedIncomeEur = Math.min(Math.max(input.monthlyHouseholdIncomeEur, floor), ceiling);
  const effortRate = pickEffortRate(rows, input.householdChildRank);
  const ratioParentEffort = (boundedIncomeEur * effortRate) / chr;
  const factor = Math.max(0, 1 - Math.min(1, ratioParentEffort));
  const monthlyCmgEur = Math.round(input.monthlyCostOfCareEur * factor * 100) / 100;

  return {
    monthlyCmgEur,
    boundedIncomeEur,
    effortRate,
    ratioParentEffort,
    formulaNote: `CMG = ${String(input.monthlyCostOfCareEur)} × (1 − min(1, (${String(boundedIncomeEur)} × ${String(effortRate)}) / ${String(chr)})) — règle ${RULE_ID}`,
  };
}
