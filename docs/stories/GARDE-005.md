# GARDE-005 — Squelette `src/scenarios/` (4 scénarios + `renderBilanTableau`)

## Links

- [`CONVENTIONS.md`](../CONVENTIONS.md)
- [`INITIAL_SPEC.md`](../INITIAL_SPEC.md) § 4–6

## User / product value

Structure prête pour brancher le moteur : **un dossier par scénario**, `compute*` + **`renderBilanTableau`**, registre des slugs, scripts CLI minimaux.

## Scope

**Inclus** : `src/scenarios/bilan-table.ts`, `registry.ts`, 4 dossiers (slug), `params.md` minimal par scénario, `scripts/scenarios/*.ts`, tests.

**Exclus** : logique métier, intégration `config/rules.*.json`.

## Acceptance criteria

1. Quatre slugs dans `SCENARIO_SLUGS` alignés sur les conventions.
2. Chaque scénario expose `compute*` et `renderBilanTableau` (fichier `render-table.ts`).
3. `bun test ./src` vert ; `bun run scripts/scenarios/creche-publique.ts` affiche JSON.

## Done checklist

- [x] Implémentation
- [x] `SPRINT_PLAN.md`
- [x] Commit `GARDE-005: …`
