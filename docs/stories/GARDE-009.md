# GARDE-009 — Assistante maternelle : CMG emploi direct + crédit F8

## Links

- [`INITIAL_SPEC.md`](../INITIAL_SPEC.md) § 3
- [`params.md`](../../src/scenarios/assistante-maternelle/params.md)
- [`DR-01-CMG-CAF.md`](../research/DR-01-CMG-CAF.md) § 4

## User / product value

Deuxième scénario **partial** : coût employeur, CMG (saisie ou **formule pack** `cmg-emploi-direct-assistante-maternelle-2026-04`), crédit d’impôt **garde hors domicile** (même logique que crèche).

## Scope

**Inclus** : `computeCmgAssmatEmploiDirectMonthly`, `computeAssistanteMaternelle`, `buildAssistanteMaternelleLignes`, tests, `params.md`.

**Exclus** : indemnités d’entretien / repas en détail, plafond journalier de salaire, non-cumuls PreParE / AEEH (règles qualitatives dans le pack seulement).

## Acceptance criteria

1. Stub sans `monthlyEmploymentCostEur` ; stub avec coût mais sans CMG ni revenu.
2. Partial avec coût + revenu (CMG calculée) ou coût + `monthlyCmgPaidEur`.
3. Crédit d’impôt via `credit-impot-garde-hors-domicile` avec déduction CMG.
4. `bun run ci` vert.

## Done checklist

- [x] Implémentation
- [x] `SPRINT_PLAN.md`
- [x] Commit `GARDE-009: …`
