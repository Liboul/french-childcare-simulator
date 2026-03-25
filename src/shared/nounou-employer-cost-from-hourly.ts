/**
 * Coût employeur Pajemploi — estimation à partir du brut horaire (Urssaf particuliers 2026).
 * Taux : https://www.urssaf.fr/accueil/outils-documentation/taux-baremes/taux-cotisations-particuliers.html
 */
export const TAUX_PATRONAL_SANS_SANTE_URSSAF_2026 = 0.44696;
export const TAUX_PATRONAL_AVEC_SANTE_URSSAF_2026 = 0.47396;
export const PLAFOND_SANTE_TRAVAIL_MENSUEL_EUR = 5.0;

/** Hypothèse documentée pour l’impact net salarial (substitution CESU), hors moteur paie. */
export const TAUX_SALARIAL_APPROX_POUR_SUBSTITUTION_CESU = 0.22;

export type NounouEmployerCostFromHourlyResult = {
  computedMonthlyGrossSalaryEur: number;
  computedMonthlyPatronalChargesEur: number;
  computedMonthlyIcpEur: number;
  monthlyEmploymentCostEur: number;
  effectivePatronalRateApplied: number;
  monthlyHoursForHousehold: number;
};

/**
 * Cotisations patronales = min(brut × 44,696 % + 5 €, brut × 47,396 %) — prise en charge santé au travail plafonnée à 5 €/mois (formulation Urssaf).
 */
export function computePatronalChargesFromGrossMonthlyEur(brutMensuel: number): {
  chargesEur: number;
  effectivePatronalRateApplied: number;
} {
  const a = brutMensuel * TAUX_PATRONAL_SANS_SANTE_URSSAF_2026 + PLAFOND_SANTE_TRAVAIL_MENSUEL_EUR;
  const b = brutMensuel * TAUX_PATRONAL_AVEC_SANTE_URSSAF_2026;
  const chargesEur = Math.round(Math.min(a, b) * 100) / 100;
  const effectivePatronalRateApplied =
    brutMensuel > 0 ? Math.round((chargesEur / brutMensuel) * 1e6) / 1e6 : 0;
  return { chargesEur, effectivePatronalRateApplied };
}

export function computeNounouEmployerCostFromHourly(input: {
  hourlyGrossRateEur: number;
  weeklyHoursFullTime: number;
  householdShareFraction: number;
  includeIcp: boolean;
  monthlyMealAllowanceEur: number;
}): NounouEmployerCostFromHourlyResult {
  const monthlyHoursForHousehold =
    (input.weeklyHoursFullTime * input.householdShareFraction * 52) / 12;
  const brutMensuel = Math.round(input.hourlyGrossRateEur * monthlyHoursForHousehold * 100) / 100;
  const { chargesEur, effectivePatronalRateApplied } =
    computePatronalChargesFromGrossMonthlyEur(brutMensuel);
  const icp = input.includeIcp ? Math.round(brutMensuel * 0.1 * 100) / 100 : 0;
  const meal = Math.max(0, input.monthlyMealAllowanceEur);
  const monthlyEmploymentCostEur = Math.round((brutMensuel + chargesEur + icp + meal) * 100) / 100;
  return {
    computedMonthlyGrossSalaryEur: brutMensuel,
    computedMonthlyPatronalChargesEur: chargesEur,
    computedMonthlyIcpEur: icp,
    monthlyEmploymentCostEur,
    effectivePatronalRateApplied,
    monthlyHoursForHousehold: Math.round(monthlyHoursForHousehold * 1e4) / 1e4,
  };
}
