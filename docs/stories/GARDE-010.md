# GARDE-010 — Agrégation scénario : reste à charge, disponible, coût employeur

| Field     | Value                                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------------------ |
| **Epic**  | E2 — Engine                                                                                                  |
| **Links** | [`INITIAL_SPEC.md`](../INITIAL_SPEC.md), **GARDE-006**–**009**, [`DR-02`](../research/DR-02-CREDIT-IMPOT.md) |

## User / product value

Pour **un** mode de garde décrit par le foyer, le moteur produit une **photo cohérente** : coût brut, CMG, crédit d’impôt (selon le routage mode), **reste à charge** équivalent annuel/mensuel, optionnellement **revenu disponible** après ce mode (à partir d’une base fournie), et un **écart de soutien employeur** vs une référence (contrôle « coût employeur constant » entre scénarios).

## Scope

**In scope**

- `computeScenarioSnapshot(pack, input)` : enchaîne `computeBrutMonthlyCost`, `estimateCmgMonthlyEur`, crédit d’impôt via `taxCreditKindForChildcareMode`, annualisation ×12 (même année fiscale simplifiée).
- Formule agrégée : `netHouseholdBurdenAnnual = max(0, annualBrut − annualCmg − annualTaxCredit)` (crédit traité comme allègement équivalent ; pas d’imposition marginale).
- Trace minimale (`CalculationTrace`) : étapes `childcare`, `family_allowances`, `tax_credits`, `summary`.
- Optionnel : `baselineDisposableIncomeMonthlyEur` → `disposableIncomeMonthly = baseline − netBurdenMonthly`.
- Optionnel : `declaredEmployerChildcareSupportAnnualEur` vs `referenceEmployerChildcareSupportAnnualEur` → delta + avertissement si ≠ 0.

**Out of scope**

- TMI / IR réel, quotient familial (**hors moteur** jusqu’à extension ultérieure).
- Normalisation automatique des entrées pour forcer l’égalité des coûts employeur (l’utilisateur aligne les montants ; on expose seulement l’écart).

## Acceptance criteria

1. Test : scénario `nounou_domicile` avec CMG > 0 et crédit emploi à domicile → `netHouseholdBurdenAnnual` < `annualBrut`.
2. Test : scénario `creche_privee` (micro-crèche éligible, CMG > 0) → routage crédit « garde hors domicile » et agrégation cohérente.
3. Test : `baselineDisposableIncomeMonthlyEur` renseigné → `disposableIncomeMonthly` attendu.
4. Test : déclaré vs référence employeur différents → avertissement + delta.
5. `bun run ci` ; commit `GARDE-010` ; sprint log.

## Technical notes

- Module `src/scenario/` ; pas de dépendance circulaire (scenario → childcare, family-allowances, tax-credits, trace).

## Deep research

Non (réutilise stories précédentes + pack).

## Done checklist

- [x] Story spec
- [x] Code + tests
- [x] Commit `GARDE-010`
- [x] Sprint log
