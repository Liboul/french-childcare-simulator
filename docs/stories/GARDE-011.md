# GARDE-011 — Incertitude : signalement, règles `todoVerify`, variantes Pajemploi

| Field     | Value                                                                                                            |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| **Epic**  | E2 — Engine                                                                                                      |
| **Links** | [`INITIAL_SPEC.md`](../INITIAL_SPEC.md) § Gestion de l’incertitude, **GARDE-003** / **GARDE-005**, **GARDE-010** |

## User / product value

Les sorties moteur exposent **explicitement** ce qui est fragile : avertissements moteur structurés, **règles du pack encore en `todoVerify` et réellement citées** par un scénario, et **lecture paramétrique** des taux Pajemploi indicatifs DR-03 vs DR-04 (sans choix silencieux — le pack impose une variante explicite pour ces chiffres).

## Scope

**In scope**

- Module `src/uncertainty/` :
  - `listTodoVerifyRules(pack)` : toutes les règles `todoVerify: true`.
  - `readPajemploiIndicativeRates(pack, variant: "dr03" | "dr04")` : taux indicatifs depuis `cotisations-pajemploi-taux-indicatifs-dr03-dr04` + avertissements.
  - `engineWarningsToFlags(warnings)` : codes connus → `{ code, severity }` ; codes inconnus conservés en `warning`.
  - `buildUncertaintyReport(pack, { engineWarnings, referencedRuleIds })` : drapeaux moteur + sous-ensemble `todoVerify` ∩ règles référencées.
- `computeScenarioSnapshot` enrichi avec `uncertainty` (même avertissements que `warnings`, plus règles pack concernées).
- `brutInputReferencedRuleIds(input)` : au minimum `garde-partagee-majoration-simultanes-dr04` si mode partagé.

**Out of scope**

- Blocage dur des calculs si `todoVerify` (on signale, on n’empêche pas l’estimation).
- UI / export JSON dédié (**GARDE-012**).

## Acceptance criteria

1. Tests : `readPajemploiIndicativeRates` DR-03 vs DR-04 → parts employeur/salarié distinctes.
2. Tests : `buildUncertaintyReport` avec `referencedRuleIds` contenant une règle `todoVerify` → elle apparaît dans `referencedRulesPendingVerification`.
3. Tests : scénario nounou partagée → `uncertainty.referencedRulesPendingVerification` contient la règle majoration garde partagée.
4. `bun run ci` ; commit `GARDE-011` ; sprint log.

## Deep research

Non.

## Done checklist

- [x] Story spec
- [x] Code + tests
- [x] Commit `GARDE-011`
- [x] Sprint log
