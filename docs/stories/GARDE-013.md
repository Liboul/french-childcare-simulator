# GARDE-013 — E3 : helpers transverses (cashflow commun + couche IR)

## Links

- [`docs/E3-scenario-review.md`](../E3-scenario-review.md) — inventaire des simulateurs et modules à extraire / à ajouter
- [`docs/research/DR-07-IR-TMI-DISPONIBLE.md`](../research/DR-07-IR-TMI-DISPONIBLE.md)
- [`docs/SPRINT_PLAN.md`](../SPRINT_PLAN.md) — Epic E3

## User / product value

- **Court terme** : moins de duplication entre scénarios (CMG saisie vs formule ; mensualisation crédit / reste à charge).
- **Moyen terme** : comparateur **« disponible après impôt »** avec barème / TMI versionnés dans `config/`, sans mélanger les règles CMG/crédits déjà isolées.

## Scope

**Phase 1 (review)** : document [`E3-scenario-review.md`](../E3-scenario-review.md) — fait.

**Phase 2a (helpers hors IR)** : `monthlyCashflowAfterAides`, `resolveCmgFromEmploymentInput`, normalisations foyer — **fait**.

**Phase 2b (IR / disponible)** : barème, TMI, façade satellite — **à faire** (DR-07).

## Acceptance criteria (à affiner en phase 2)

1. Helpers extraits couverts par tests ; comportement des `compute*` inchangé pour les cas existants.
2. Couche IR : paramètres sourcés ou `todoVerify` ; pas de confusion TMI / PAS (DR-07).
3. `SPRINT_PLAN` + exports `src/shared/index.ts` cohérents.

## Done checklist

- [x] Review scénarios → [`E3-scenario-review.md`](../E3-scenario-review.md)
- [x] Phase 2a : helpers + refactor scénarios + exports `src/shared/index.ts`
- [ ] Phase 2b : IR / barème / TMI (ou story dédiée)
- [ ] `SPRINT_PLAN` story log (à la clôture E3 complète)
