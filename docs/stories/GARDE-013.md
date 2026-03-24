# GARDE-013 — E3 : helpers transverses (cashflow commun + couche IR)

## Links

- [`docs/E3-scenario-review.md`](../E3-scenario-review.md)
- [`docs/research/DR-07-IR-TMI-DISPONIBLE.md`](../research/DR-07-IR-TMI-DISPONIBLE.md)
- [`docs/SPRINT_PLAN.md`](../SPRINT_PLAN.md)

## User / product value

- **Court terme** : moins de duplication entre scénarios (CMG saisie vs formule ; mensualisation crédit / reste à charge).
- **Moyen terme** : **TMI** et **IR brut indicatif** depuis le pack (pas le PAS), pour un futur comparateur « net après impôt » sans dupliquer les crédits garde déjà calculés dans les scénarios.

## Scope

**Phase 1** : review — [`E3-scenario-review.md`](../E3-scenario-review.md).

**Phase 2a** : `monthlyCashflowAfterAides`, `resolveCmgFromEmploymentInput`, `household` — refactor des quatre `compute*`.

**Phase 2b** : règle `ir-bareme-revenus-2025-imposition-2026` + [`ir-impot-revenu.ts`](../../src/shared/ir-impot-revenu.ts) (`readIrBaremeParams`, `computeTmiMarginalQuotient`, `computeIrFoyerSimplifie`, etc.). Hors décote / plafonnement QF ; avertissements explicites.

**Hors scope** : branchement `simulate.mjs`, « disponible mensuel » agrégé (story ultérieure si besoin).

## Acceptance criteria

1. Helpers extraits couverts par tests ; comportement des `compute*` inchangé pour les cas existants.
2. Barème + TMI : paramètres dans `config/rules.fr-2026.json` ; tests alignés DR-07 §2–3 (tolérance arrondis).
3. Exports `src/shared/index.ts` ; schéma `impot_revenu` ; `SPRINT_PLAN` à jour.

## Done checklist

- [x] Review scénarios
- [x] Phase 2a + phase 2b
- [x] `SPRINT_PLAN` story log
