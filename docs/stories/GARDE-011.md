# GARDE-011 — Crèche / berceau employeur : F8 + seuil aide employeur

## Links

- [`INITIAL_SPEC.md`](../INITIAL_SPEC.md) § 3
- [`params.md`](../../src/scenarios/creche-berceau-employeur/params.md)
- [`DR-03-CESU-EMPLOYEUR.md`](../research/DR-03-CESU-EMPLOYEUR.md)

## User / product value

Quatrième scénario **partial** : même cœur **part famille + CMG + crédit F8** que la crèche publique, plus **ventilation** de l’aide employeur annuelle avec **seuil d’exonération** (1 830 € / enfant, pack `avantage-employeur-creche-seuil-exoneration`).

## Scope

**Inclus** : `readAvantageEmployeurCrecheParams`, `computeEmployerChildcareAidTaxableExcessAnnual`, `computeCrecheBerceauEmployeur`, `buildCrecheBerceauEmployeurLignes`, tests, `params.md`.

**Exclus** : coût employeur total, baisse de brut, CESU préfinancé détaillé.

## Acceptance criteria

1. Stub sans `monthlyParticipationEur` ; partial avec participation.
2. Lignes bilan : participation, CMG, aide employeur, seuil / excédent imposable, F8, effort net.
3. `bun run ci` vert.

## Done checklist

- [x] Implémentation
- [x] `SPRINT_PLAN.md`
- [x] Commit `GARDE-011: …`
