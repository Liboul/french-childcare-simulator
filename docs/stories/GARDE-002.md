# GARDE-002 — Traceability model (`CalculationStep`, sources, empty trace)

| Field     | Value                                                                                                           |
| --------- | --------------------------------------------------------------------------------------------------------------- |
| **Epic**  | E0 — Foundation                                                                                                 |
| **Links** | [`INITIAL_SPEC.md`](../INITIAL_SPEC.md) (MODÈLE DE CALCUL, transparence), [`SPRINT_PLAN.md`](../SPRINT_PLAN.md) |

## User / product value

Every future euro calculation can attach to **steps**, **formulas**, and **official sources**, matching the product’s transparency requirement.

## Scope

**In scope:** TypeScript types and small helpers for `SourceRef`, calculation blocks **A–G**, `CalculationStep`, `CalculationTrace`; unit tests; exports from `src/`.

**Out of scope:** Config barèmes (GARDE-003), numeric engine, JSON/HTML exporters.

## Acceptance criteria

1. Blocks **A–G** match the spec labels (foyer, mode, employeur, CAF/CMG, crédits, fiscalité, résultat).
2. Each step carries: id, block, order, label, formula string, optional rule id, **sources** (≥0 refs with title + URL).
3. A trace is an ordered list of steps; helpers allow immutable append.
4. Tests cover a minimal multi-step trace and source attachment.

## Technical notes

- Keep types **readonly** where possible.
- Money amounts as structured fields can wait for later stories; optional `valueNotes` string on step is enough for scaffolding.

## Deep research

No.

## Test plan

- Build trace with two steps, different blocks, assert order and source URLs.

## Risks & mitigations

- Low risk; naming can evolve when engine lands.

## Done checklist

- [x] Story spec (this file)
- [x] Implementation + tests
- [x] Commit `GARDE-002`
- [x] Sprint plan completion log updated
