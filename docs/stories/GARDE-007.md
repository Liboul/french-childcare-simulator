# GARDE-007 — Moteur : chargement du pack + métadonnées bilan

## Links

- [`INITIAL_SPEC.md`](../INITIAL_SPEC.md) — traçabilité, tableau
- [`config/rules.fr-2026.json`](../../config/rules.fr-2026.json)

## User / product value

Les scénarios et le **tableau de bilan** reflètent le **pack de règles versionné** (SMIC de référence, etc.), pas un texte figé dans le code.

## Scope

**Inclus** : `getRulePack()` (cache, résolution de chemin), `baseBilanLignes`, `meta` sur chaque résultat de scénario, `simulate.mjs` avec `meta.rulePackVersion` / `effectiveFrom`, package skill : copie de `src/config/` et `src/shared/` dans le distillat (imports résolus hors bundle).

**Exclus** : calcul métier complet (reste `stub`).

## Acceptance criteria

1. Chaque `compute*` charge le pack et renvoie `meta.rulePackVersion` et `meta.effectiveFrom`.
2. Chaque `renderBilanTableau` inclut au moins : ligne pack, ligne SMIC (règle `tarif-smic-horaire-metropole-2026`), placeholder reste à charge.
3. `node scripts/simulate.mjs <slug>` expose en tête de sortie `meta` avec `engineVersion`, `rulePackVersion`, `effectiveFrom`.
4. Tests verts + `bun run ci`.

## Done checklist

- [x] Implémentation
- [x] `SPRINT_PLAN.md`
- [x] Commit `GARDE-007: …`
