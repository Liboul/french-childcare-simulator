# GARDE-003 — Config schema for barèmes / plafonds + validation

| Field     | Value                                                                                                                                         |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Epic**  | E0 — Foundation                                                                                                                               |
| **Links** | [`INITIAL_SPEC.md`](../INITIAL_SPEC.md) (fichiers de configuration), [`SPRINT_PLAN.md`](../SPRINT_PLAN.md), **GARDE-002** (`SourceRef` shape) |

## User / product value

Official coefficients and ceilings live in **versioned config** (guard rail: no magic numbers in code). This story defines the **schema** and **validation** so GARDE-005 can load real data safely.

## Scope

**In scope:** Zod (or equivalent) schemas, `parseRulePack` / helpers, example `config/rules.example.json`, tests for valid/invalid payloads.

**Out of scope:** Real 2026 fiscal values (**GARDE-004** research + **GARDE-005** import).

## Acceptance criteria

1. JSON rule packs declare **version**, **effectiveFrom** (ISO date), optional **effectiveTo**, **sources** registry, and **rules** entries with ids, labels, category, **sources** (≥1 URL per rule recommended; schema allows structure for `TODO-VERIFY`).
2. Parsing fails fast with clear errors on invalid URL or missing required fields.
3. Example file under `config/` validates and is referenced in README or comment.

## Technical notes

- Use **Zod** for runtime validation (TypeScript-first).
- Categories are extensible string union or enum: e.g. `cmg`, `credit_impot`, `tarif`, `autre`.

## Deep research

No (structure only; no legal amounts).

## Test plan

- Happy path: load example config.
- Reject: bad URL, missing `version`, empty rules array if we require ≥1 — **decision**: allow empty `rules` for bootstrap until GARDE-005.

## Done checklist

- [x] Story spec (this file)
- [x] Implementation + tests
- [x] Commit `GARDE-003`
- [x] Sprint plan completion log updated
