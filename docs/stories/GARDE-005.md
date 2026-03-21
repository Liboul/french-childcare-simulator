# GARDE-005 — Import official parameters into config (versioned, dated)

| Field     | Value                                                                                                                                                                                                                               |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Epic**  | E1 — Rules & data                                                                                                                                                                                                                   |
| **Links** | [`INITIAL_SPEC.md`](../INITIAL_SPEC.md), [`SPRINT_PLAN.md`](../SPRINT_PLAN.md), **GARDE-003** (schema), **GARDE-004** (DR-01–DR-04), research: [`DR-01`](../research/DR-01-CMG-CAF.md) … [`DR-04`](../research/DR-04-COUT-MODES.md) |

## User / product value

Fiscal and social parameters from the research packs become **loadable, validated data** with **source refs** (or explicit `todoVerify`), so the engine never relies on undocumented magic numbers.

## Scope

**In scope**

- One versioned rule pack JSON (`config/rules.fr-2026.json`) that `parseRulePack` accepts.
- Rule rows grouped by domain (CMG, crédit d’impôt, cotisations/tarifs indicatifs, avantages employeur) with `parameters` shaped for upcoming engine stories.
- Values taken **only** from DR-01–DR-04; where research conflicts, gives **both** figures in parameters and/or `todoVerify` + `notes`.
- Vitest: pack parses; spot-check critical ids and numbers; rejections unchanged from GARDE-003.

**Out of scope**

- CMG formula implementation (**GARDE-007**), full cumul engine, URSSAF rate tables when DR-03 marks them unverified.

## Acceptance criteria

1. `config/rules.fr-2026.json` declares `version`, `effectiveFrom` (ISO), optional `effectiveTo`, `sources` index, and `rules[]` with valid URLs **or** `todoVerify: true` per GARDE-003 guard rail.
2. DR-01: CMG emploi direct (garde à domicile + assistante-type params), structure (tranches, montants jusqu’au 31/03/2026, plafond 10 €/h micro-crèche, reste à charge min 15 %), non-cumul PreParE / majorations AAH-AEEH (as qualitative parameters), Mayotte / Alsace-Moselle flags where DR provides numbers.
3. DR-02: crédit d’impôt garde hors domicile (50 %, plafonds 3 500 / 1 750) et emploi à domicile (50 %, plafonds 12 000 + majorations, max 15 000 / 18 000 selon F12).
4. DR-03: seuil **1 830 €/an** avantage crèche (jurisprudence — `todoVerify`), non-cumul CESU × CMG (qualitatif), taux cotisations **approximatifs** DR-03 vs DR-04 dans une règle `todoVerify` sans choix silencieux.
5. DR-04: SMIC horaire 12,02 € (métropole), formules indicatives nounou / partagée / assmat / MAM, plafond tarif micro-crèche cohérent avec DR-01.
6. `bun run ci` passes.

## Technical notes

- Prefer **Service-Public** / **Légifrance** URLs verified in-session (F8, F12, F345, F39152, F2300, CSS D531 section).
- Pack `version` is semver-style (`2026.1.0`); `effectiveFrom` `2026-01-01` with rule-level `parameters.validThrough` where DR-01 phases amounts (ex. structure jusqu’au 31/03/2026).
- DR-01 “0,1238 %” effort rates stored as decimal fractions of revenue (`0.001238`) with a `parameterEncoding` note — confirm against official simulator in a later story.

## Deep research

No new delegation: encodes **existing** DR-01–DR-04 only.

## Test plan

- `parseRulePack` on `rules.fr-2026.json` → `ok`.
- Assert presence of rules: `cmg-emploi-direct-garde-domicile-2026-04`, `credit-impot-garde-hors-domicile`, `tarif-smic-horaire-metropole-2026`.
- Assert SMIC = 12.02, credit max base child full custody = 3500.

## Risks & mitigations

- Research vs law drift → dated pack + sources + `todoVerify` on estimates (ex. plafonds cotisations CMG garde à domicile “estimation avril 2026” in DR-01).
- Conflicting indicatif cotisation rates (DR-03 vs DR-04) → single rule exposes both; engine must take explicit policy later (**GARDE-011**).

## Done checklist

- [x] Story spec (this file)
- [x] `config/rules.fr-2026.json` + tests
- [x] Commit `GARDE-005`
- [x] Sprint plan completion log updated

## Sprint plan

After close: row in [`SPRINT_PLAN.md`](../SPRINT_PLAN.md) Story completion log.
