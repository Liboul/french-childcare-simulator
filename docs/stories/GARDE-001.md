# GARDE-001 — Project bootstrap (TypeScript, Bun, tooling)

| Field     | Value                                                                                                                   |
| --------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Epic**  | E0 — Foundation                                                                                                         |
| **Links** | [`SPRINT_PLAN.md` § Tech stack](../SPRINT_PLAN.md#tech-stack), [`INITIAL_SPEC.md`](../INITIAL_SPEC.md) (architecture §) |

## User / product value

Establishes a consistent, testable codebase so later fiscal logic ships with lint, format, tests, and CI from day one.

## Scope

**In scope:** Bun + TypeScript (strict), Vitest, ESLint, Prettier, npm scripts, `.editorconfig`, minimal `src/` + sample test, GitHub Actions CI, `.gitignore`.

**Out of scope:** Calculation engine, config barèmes, harness/skill packaging.

## Acceptance criteria

1. `bun install` succeeds; lockfile committed (`bun.lock`).
2. `bun run typecheck` passes (strict TS).
3. `bun run test` runs Vitest and passes.
4. `bun run lint` runs ESLint on `src/`.
5. `bun run format` runs Prettier check (or `format:write` for write).
6. CI workflow runs typecheck, lint, test on push/PR to `main`.
7. `config/` directory exists (empty or `.gitkeep`) for future barèmes.

## Technical notes

- ESLint 9 flat config; `eslint-config-prettier` to avoid conflicts with Prettier.
- No fiscal numbers or business rules in this story.

## Deep research

No.

## Test plan

- Sample unit test imports project entry; CI runs full suite.

## Risks & mitigations

- Low risk; tooling-only.

## Done checklist

- [x] Story spec (this file)
- [x] Implementation + tests
- [x] Commit message references `GARDE-001`
- [x] Sprint plan completion log updated
