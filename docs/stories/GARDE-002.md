# GARDE-002 — Bootstrap toolchain (Bun, TS, bun test, ESLint, Prettier, CI)

## Links

- [`INITIAL_SPEC.md`](../INITIAL_SPEC.md) § 10
- [`SPRINT_PLAN.md`](../SPRINT_PLAN.md)

## User / product value

Disposer d’un **socle** pour réimplémenter les scénarios sans friction : typecheck, `bun test`, lint, format, CI verte.

## Scope

**Inclus** : `package.json`, `tsconfig.json`, `eslint.config.mjs`, Prettier, `.editorconfig`, `src/index.ts` + test minimal (`bun:test`), script `bun test ./src` (évite `./trash/src`), workflow GitHub Actions `bun run ci`, `docs/SPRINT_PLAN.md`, `docs/CONVENTIONS.md`, `CONTRIBUTING.md`.

**Exclus** : scénarios métier, harness, skill ZIP, `zod` (story ultérieure).

## Acceptance criteria

1. `bun install` puis `bun run ci` réussit localement (typecheck, lint, format check, tests).
2. CI sur `main` / PR exécute la même chaîne.
3. Documentation sprint + conventions + contributing référencent `INITIAL_SPEC`.

## Technical notes

- Lint : `src` uniquement (pas de `harness/` ni `scripts/` tant qu’absents).
- Pas de dépendance runtime pour cette story.

## Deep research

Non.

## Test plan

- `src/index.test.ts` : assertion minimale.
- CI : `bun install --frozen-lockfile`.

## Risks & mitigations

- Aucun risque fiscal.

## Done checklist

- [x] Implémentation
- [x] `bun run ci` vert
- [x] Story completion log
- [x] Commit `GARDE-002: …`
