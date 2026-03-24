# GARDE-003 — Schéma et validation du pack de règles (Zod)

## Links

- [`INITIAL_SPEC.md`](../INITIAL_SPEC.md) § 9 (config versionnée)
- [`SPRINT_PLAN.md`](../SPRINT_PLAN.md)

## User / product value

Garantir qu’un fichier `config/rules.*.json` est **structurellement valide**, **traçable** (sources ou `todoVerify`), et **chargeable** par le moteur sans constantes magiques dans le code.

## Scope

**Inclus** : `rulePackSchema`, `parseRulePack`, `findRule`, `config/rules.example.json`, réimport de `config/rules.fr-2026.json` depuis l’ancienne base, tests sur exemple + pack 2026.

**Exclus** : typage fin des `parameters` par règle (stories ultérieures), moteur scénario.

## Acceptance criteria

1. `parseRulePack(unknown)` retourne `{ ok, data }` ou `{ ok: false, error }`.
2. Une règle sans `sources` est rejetée sauf si `todoVerify: true`.
3. `config/rules.fr-2026.json` parse et quelques `id` de règles attendus ont les bons paramètres (SMIC, crédit garde, CMG dom, plafond CESU).
4. Export barrel `src/config/index.ts` + réexport depuis `src/index.ts`.

## Technical notes

- Dépendance **`zod`** (runtime, utilisée par le parseur).
- Imports JSON avec `with { type: "json" }` (Bun).

## Deep research

Non (réutilisation du pack déjà validé dans l’ancienne base).

## Test plan

- Cas valide vide, URL invalide, règle sans source, `todoVerify`, intégration `rules.fr-2026.json`.

## Risks & mitigations

- Dérive du JSON : tests d’intégration sur quelques `id` stables.

## Done checklist

- [x] Implémentation + tests verts
- [x] `SPRINT_PLAN.md` (log)
- [x] Commit `GARDE-003: …`
