import type { FrenchIncomeTaxEstimate2026 } from "../income-tax/estimate-fr-2026";
import type { ScenarioInput } from "./types";

/**
 * Quand `disposableIncomeMonthlyEur` reste `null`, explique quels champs manquent ou quelles réserves s’appliquent (points 4 / shipping).
 */
export function buildIncomeTaxDisposableHintsFr(
  input: ScenarioInput,
  disposableIncomeMonthlyEur: number | null,
  incomeTaxEstimate: FrenchIncomeTaxEstimate2026 | null,
): string[] {
  if (disposableIncomeMonthlyEur != null) return [];

  const it = input.incomeTax;
  if (!it) return [];

  const hasAfterIr = it.annualHouseholdIncomeAfterIncomeTaxEur != null;
  const hasBaseline = input.baselineDisposableIncomeMonthlyEur != null;
  if (hasAfterIr || hasBaseline) return [];

  const hints: string[] = [];
  if (incomeTaxEstimate != null) {
    hints.push(
      "L’estimation IR / TMI est volontairement simplifiée (voir `warnings` et `limitationHints`) ; ce n’est pas un calcul d’impôt complet.",
    );
    hints.push(
      "`disposableIncomeMonthlyEur` (disponible après garde) n’est calculé que si vous renseignez `incomeTax.annualHouseholdIncomeAfterIncomeTaxEur` ou `baselineDisposableIncomeMonthlyEur` (voir schéma).",
    );
  }
  if (it.annualNetSalaryFromPayslipsEur != null) {
    hints.push(
      "Le salaire net des bulletins (`annualNetSalaryFromPayslipsEur`) est après cotisations sociales et **avant** impôt sur le revenu : il ne remplace pas `annualHouseholdIncomeAfterIncomeTaxEur`.",
    );
  }
  return hints;
}
