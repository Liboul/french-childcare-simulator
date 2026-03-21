import { findRule } from "../../config/find-rule";
import type { RulePack } from "../../config/schema";
import { applyCmgCumulFromPack } from "./cumul";
import type { CmgEstimateRequest, CmgEstimateResult } from "./types";

type EffortBracket = { minRank: number; maxRank: number | null; effortRate: number };

function roundMoney2(n: number): number {
  return Math.round(n * 100) / 100;
}

function pickEffortRate(
  rank: number,
  brackets: EffortBracket[],
): { rate: number; extrapolated: boolean } {
  for (const b of brackets) {
    const maxOk = b.maxRank == null ? true : rank <= b.maxRank;
    if (rank >= b.minRank && maxOk) {
      return { rate: b.effortRate, extrapolated: false };
    }
  }
  const last = brackets[brackets.length - 1];
  if (last) {
    return { rate: last.effortRate, extrapolated: true };
  }
  throw new Error("Empty effortRateByHouseholdChildRank in rule pack");
}

function clampMonthlyIncome(
  monthly: number,
  floor: number,
  ceiling: number,
): { value: number; clamped: boolean } {
  if (monthly < floor) return { value: floor, clamped: true };
  if (monthly > ceiling) return { value: ceiling, clamped: true };
  return { value: monthly, clamped: false };
}

function resolveStructureTranche(
  annualIncome: number,
  dependentChildren: number,
  isSingleParent: boolean,
  tranches: Array<{
    dependentChildren: number;
    tranche1MaxAnnualEur: number;
    tranche2MaxAnnualEur: number;
  }>,
  singleParentMultiplier: number,
): { tier: "T1" | "T2" | "T3"; ruleIds: string[]; warning?: string } {
  const ruleIds = ["cmg-structure-tranches-ressources-annuelles-n2"];
  const row =
    tranches.find((t) => t.dependentChildren === dependentChildren) ??
    tranches[tranches.length - 1];
  let w: string | undefined;
  if (!tranches.find((t) => t.dependentChildren === dependentChildren)) {
    w = "structure_tranches_using_last_row_children_count";
  }
  if (!row) {
    throw new Error("Empty tranchesByDependentChildren in rule pack");
  }
  const m = isSingleParent ? singleParentMultiplier : 1;
  const t1 = row.tranche1MaxAnnualEur * m;
  const t2 = row.tranche2MaxAnnualEur * m;
  if (annualIncome <= t1) return { tier: "T1", ruleIds, warning: w };
  if (annualIncome <= t2) return { tier: "T2", ruleIds, warning: w };
  return { tier: "T3", ruleIds, warning: w };
}

export function estimateCmgMonthlyEur(pack: RulePack, req: CmgEstimateRequest): CmgEstimateResult {
  const warnings: string[] = [];
  const ruleIds: string[] = [];

  const unsupportedModes = new Set<string>(["creche_publique", "creche_inter_entreprises"]);
  if (unsupportedModes.has(req.mode)) {
    return {
      status: "unsupported",
      monthlyCmgEur: 0,
      ruleIds: [],
      warnings: ["cmg_psu_or_non_structure_branch_not_modeled"],
      branch: "none",
    };
  }

  if (req.mode === "creche_privee") {
    return estimateStructure(pack, req, warnings, ruleIds);
  }

  if (
    req.mode === "nounou_domicile" ||
    req.mode === "nounou_partagee" ||
    req.mode === "assistante_maternelle" ||
    req.mode === "mam"
  ) {
    const gardeDomicile = req.mode === "nounou_domicile" || req.mode === "nounou_partagee";
    return estimateEmploiDirect(pack, req, gardeDomicile, warnings, ruleIds);
  }

  return {
    status: "unsupported",
    monthlyCmgEur: 0,
    ruleIds: [],
    warnings: ["unexpected_childcare_mode"],
    branch: "none",
  };
}

function estimateEmploiDirect(
  pack: RulePack,
  req: CmgEstimateRequest,
  gardeDomicile: boolean,
  warnings: string[],
  ruleIds: string[],
): CmgEstimateResult {
  const ruleId = gardeDomicile
    ? "cmg-emploi-direct-garde-domicile-2026-04"
    : "cmg-emploi-direct-assistante-maternelle-2026-04";
  const rule = findRule(pack, ruleId);
  if (!rule?.parameters) {
    return {
      status: "ineligible",
      monthlyCmgEur: 0,
      ruleIds: [],
      warnings: [`missing_rule_${ruleId}`],
      branch: "none",
    };
  }
  ruleIds.push(ruleId);

  const p = rule.parameters as Record<string, unknown>;
  const chr = p.hourlyReferenceCostEur as number;
  const maxHourly = p.maxHourlySalaryCountedEur as number;
  const floor = p.incomeFloorMonthlyEur as number | undefined;
  const ceiling = p.incomeCeilingMonthlyEur as number | undefined;
  const brackets = p.effortRateByHouseholdChildRank as EffortBracket[];

  const monthlyIncome = req.monthlyReferenceIncomeEur;
  const rank = req.householdEffortRank ?? 1;
  const hourly = req.hourlyDeclaredGrossEur;
  const hours = req.heuresParMois;

  if (
    typeof monthlyIncome !== "number" ||
    typeof hourly !== "number" ||
    typeof hours !== "number" ||
    !Number.isFinite(monthlyIncome) ||
    !Number.isFinite(hourly) ||
    !Number.isFinite(hours)
  ) {
    return {
      status: "ineligible",
      monthlyCmgEur: 0,
      ruleIds,
      warnings: ["missing_emploi_direct_numeric_inputs"],
      branch: gardeDomicile ? "emploi_direct_garde_domicile" : "emploi_direct_assmat_mam",
    };
  }

  if (hours <= 0) {
    return {
      status: "ineligible",
      monthlyCmgEur: 0,
      ruleIds,
      warnings: ["hours_must_be_positive"],
      branch: gardeDomicile ? "emploi_direct_garde_domicile" : "emploi_direct_assmat_mam",
    };
  }

  let incomeForFormula = monthlyIncome;
  if (typeof floor === "number" && typeof ceiling === "number") {
    const incomeClamped = clampMonthlyIncome(monthlyIncome, floor, ceiling);
    incomeForFormula = incomeClamped.value;
    if (incomeClamped.clamped) {
      warnings.push("monthly_income_clamped_to_pack_floor_ceiling");
    }
  } else {
    warnings.push("monthly_income_not_clamped_missing_floor_ceiling_in_rule");
  }

  const { rate, extrapolated } = pickEffortRate(rank, brackets);
  if (extrapolated) {
    warnings.push("effort_rate_used_last_bracket_rank_not_in_table");
  }

  const effectiveHourly = Math.min(hourly, maxHourly);
  const monthlyCountedCare = roundMoney2(effectiveHourly * hours);
  const ratio = (incomeForFormula * rate) / chr;
  const factor = 1 - ratio;
  const raw = monthlyCountedCare * factor;
  const base = roundMoney2(Math.max(0, Math.min(raw, monthlyCountedCare)));

  const cumul = applyCmgCumulFromPack(pack, base, req.cumul);
  ruleIds.push(...cumul.ruleIds);

  return {
    status: "ok",
    monthlyCmgEur: cumul.amountEur,
    ruleIds,
    warnings,
    branch: gardeDomicile ? "emploi_direct_garde_domicile" : "emploi_direct_assmat_mam",
  };
}

function estimateStructure(
  pack: RulePack,
  req: CmgEstimateRequest,
  warnings: string[],
  ruleIds: string[],
): CmgEstimateResult {
  const maxHourlyRule = findRule(pack, "cmg-structure-plafond-tarif-horaire-microcreche");
  const maxHourly = maxHourlyRule?.parameters?.maxHourlyFeeEur;
  if (typeof req.hourlyCrecheFeeEur === "number" && typeof maxHourly === "number") {
    ruleIds.push("cmg-structure-plafond-tarif-horaire-microcreche");
    if (req.hourlyCrecheFeeEur > maxHourly) {
      return {
        status: "ineligible",
        monthlyCmgEur: 0,
        ruleIds,
        warnings: ["hourly_fee_exceeds_pack_max_for_cmg_structure"],
        branch: "structure_microcreche",
      };
    }
  }

  const trRule = findRule(pack, "cmg-structure-tranches-ressources-annuelles-n2");
  const amtRule = findRule(pack, "cmg-structure-montants-mensuels-jusquau-2026-03-31");
  const racRule = findRule(pack, "cmg-structure-rac-minimum-ratio");

  if (!trRule?.parameters || !amtRule?.parameters || !racRule?.parameters) {
    return {
      status: "ineligible",
      monthlyCmgEur: 0,
      ruleIds,
      warnings: ["missing_structure_rules_in_pack"],
      branch: "structure_microcreche",
    };
  }

  const annual = req.annualReferenceIncomeN2Eur;
  const dep = req.structureDependentChildren ?? 1;
  const single = Boolean(req.isSingleParentHousehold);
  const age = req.childAgeBand ?? "under3";
  const expense = req.monthlyStructureExpenseEur;

  if (typeof annual !== "number" || typeof expense !== "number") {
    return {
      status: "ineligible",
      monthlyCmgEur: 0,
      ruleIds,
      warnings: ["missing_structure_annual_income_or_expense"],
      branch: "structure_microcreche",
    };
  }

  const trParams = trRule.parameters as {
    tranchesByDependentChildren: Array<{
      dependentChildren: number;
      tranche1MaxAnnualEur: number;
      tranche2MaxAnnualEur: number;
    }>;
    singleParentMultiplierOnThresholds: number;
  };
  const {
    tier,
    ruleIds: trIds,
    warning: trWarn,
  } = resolveStructureTranche(
    annual,
    dep,
    single,
    trParams.tranchesByDependentChildren,
    trParams.singleParentMultiplierOnThresholds,
  );
  ruleIds.push(...trIds);
  if (trWarn) warnings.push(trWarn);

  const amounts = amtRule.parameters as {
    amountsEurMonthly: {
      under3: Record<string, number>;
      age3to6: Record<string, number>;
    };
  };
  const band =
    age === "under3" ? amounts.amountsEurMonthly.under3 : amounts.amountsEurMonthly.age3to6;
  let monthlyAid = band[tier];
  if (typeof monthlyAid !== "number") {
    return {
      status: "ineligible",
      monthlyCmgEur: 0,
      ruleIds,
      warnings: ["structure_amount_missing_for_tier_age"],
      branch: "structure_microcreche",
    };
  }
  ruleIds.push("cmg-structure-montants-mensuels-jusquau-2026-03-31");

  if (req.territory === "mayotte" && tier === "T1" && age === "under3") {
    const my = findRule(pack, "cmg-mayotte-structure-montant-t1-under3");
    const cap = my?.parameters?.maxMonthlyAidEur;
    if (typeof cap === "number") {
      monthlyAid = cap;
      ruleIds.push("cmg-mayotte-structure-montant-t1-under3");
    }
  }

  const minFamily = racRule.parameters.minimumFamilyShareOfExpense as number;
  ruleIds.push("cmg-structure-rac-minimum-ratio");
  const maxAidFromExpense = roundMoney2(expense * (1 - minFamily));
  const base = roundMoney2(Math.min(monthlyAid, maxAidFromExpense));

  const cumul = applyCmgCumulFromPack(pack, base, req.cumul);
  ruleIds.push(...cumul.ruleIds);

  return {
    status: "ok",
    monthlyCmgEur: cumul.amountEur,
    ruleIds,
    warnings,
    branch: "structure_microcreche",
  };
}
