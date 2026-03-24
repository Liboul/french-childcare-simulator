# GARDE-012 — `simulate.mjs` : JSON par slug + validation Zod

## Links

- [`skill/INTAKE.md`](../../skill/INTAKE.md)
- [`packaging/README.md`](../packaging/README.md)

## User / product value

Un **seul** script `scripts/simulate.mjs` ; entrées **par scénario** via JSON ; **erreurs explicites** (`validation`, `json_parse`) pour que l’agent corrige les champs sans deviner.

## Scope

**Inclus** : `src/scenarios/simulate-input.ts` (Zod `.strict()` par slug), `simulate-input.test.ts`, `skill-simulate-entry.ts` (argv / `SIMULATE_INPUT` / stdin `-`), INTAKE + SKILL + packaging + CI.

**Exclus** : autre CLI, schéma OpenAPI.

## Acceptance criteria

1. `{}` ou absent → stub quand le moteur l’exige ; JSON valide → partial si données suffisantes.
2. Clé inconnue ou type invalide → exit 1 + JSON `{ error: "validation", issues, allowedKeys }`.
3. `bun run ci` + `package:skill` ; ZIP sans `*.test.ts` sous `src/`.

## Done checklist

- [x] Implémentation
- [x] `SPRINT_PLAN.md` + INTAKE / SKILL / packaging / CI
