# GARDE-010 — Nounou à domicile : CMG garde à domicile + crédit emploi à domicile

## Links

- [`INITIAL_SPEC.md`](../INITIAL_SPEC.md) § 3
- [`params.md`](../../src/scenarios/nounou-domicile/params.md)
- [`DR-01-CMG-CAF.md`](../research/DR-01-CMG-CAF.md) § 3
- [`DR-02-CREDIT-IMPOT.md`](../research/DR-02-CREDIT-IMPOT.md)

## User / product value

Troisième scénario **partial** : emploi à domicile avec **CMG emploi direct garde à domicile** et crédit d’impôt **CGI 199 sexdecies** (pas F8) ; rappel du non-cumul avec le crédit hors domicile.

## Scope

**Inclus** : `computeCmgGardeDomicileEmploiDirectMonthly`, `computeCreditEmploiDomicileAnnual`, `computeNounouDomicile`, `buildNounouDomicileLignes`, tests, `params.md`.

**Exclus** : co-employeurs, ventilation 50 % cotisations CAF, premier année plafond 15 k€ spécifique.

## Acceptance criteria

1. Stub sans coût ou sans CMG/revenu ; partial sinon.
2. Crédit = 50 % des dépenses éligibles dans le plafond annuel (majorations, garde alternée sur majoration).
3. Notes explicites sur non-cumul F8 / 199 sexdecies.
4. `bun run ci` vert.

## Done checklist

- [x] Implémentation
- [x] `SPRINT_PLAN.md`
- [x] Commit `GARDE-010: …`
