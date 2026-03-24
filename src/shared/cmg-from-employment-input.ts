/**
 * Résolution CMG pour modes **emploi direct** (assmat, garde à domicile) :
 * saisie mensuelle ou formule depuis le pack.
 */

export function isExplicitMonthlyCmgProvided(
  monthlyCmgPaidEur: number | undefined | null,
): boolean {
  return (
    monthlyCmgPaidEur !== undefined &&
    monthlyCmgPaidEur !== null &&
    !Number.isNaN(monthlyCmgPaidEur)
  );
}

export function isIncomeProvidedForCmgFormula(
  monthlyHouseholdIncomeForCmgEur: number | undefined | null,
): boolean {
  return (
    monthlyHouseholdIncomeForCmgEur !== undefined &&
    monthlyHouseholdIncomeForCmgEur !== null &&
    !Number.isNaN(monthlyHouseholdIncomeForCmgEur)
  );
}

export type CmgEmploymentResolution<Detail> =
  | { kind: "saisie"; monthlyCmgEur: number }
  | { kind: "calcul_pack"; monthlyCmgEur: number; detail: Detail }
  | { kind: "missing_rule" };

/**
 * @returns `null` si ni saisie ni revenu pour formule — le scénario renvoie alors un stub.
 */
export function resolveCmgFromEmploymentInput<Detail extends { monthlyCmgEur: number }>(opts: {
  monthlyCmgPaidEur?: number | null;
  monthlyHouseholdIncomeForCmgEur?: number | null;
  monthlyEmploymentCostEur: number;
  householdChildRank: number;
  computeFromPack: (args: {
    monthlyHouseholdIncomeEur: number;
    monthlyCostOfCareEur: number;
    householdChildRank: number;
  }) => Detail | null | undefined;
}): CmgEmploymentResolution<Detail> | null {
  const hasExplicit = isExplicitMonthlyCmgProvided(opts.monthlyCmgPaidEur);
  const hasIncome = isIncomeProvidedForCmgFormula(opts.monthlyHouseholdIncomeForCmgEur);
  if (!hasExplicit && !hasIncome) {
    return null;
  }
  if (hasExplicit) {
    return { kind: "saisie", monthlyCmgEur: Math.max(0, opts.monthlyCmgPaidEur!) };
  }
  const computed = opts.computeFromPack({
    monthlyHouseholdIncomeEur: opts.monthlyHouseholdIncomeForCmgEur!,
    monthlyCostOfCareEur: opts.monthlyEmploymentCostEur,
    householdChildRank: opts.householdChildRank,
  });
  if (!computed) {
    return { kind: "missing_rule" };
  }
  return {
    kind: "calcul_pack",
    monthlyCmgEur: computed.monthlyCmgEur,
    detail: computed,
  };
}
