# GARDE-029 — Tests contrat OpenAPI / démos / snapshots

| Field     | Value                                                                   |
| --------- | ----------------------------------------------------------------------- |
| **Epic**  | E0 — Foundation                                                         |
| **Links** | `harness/openapi.yaml`, `docs/demo-scenarios/`, tests harness existants |

## User / product value

Les **exemples** vus par les intégrateurs (OpenAPI, JSON démo) restent **alignés** sur le moteur après refactor.

## Scope

**In scope**

- Tests qui exécutent `calculateScenario` sur chaque fichier `docs/demo-scenarios/*.json` et valident des **invariants** (structure `ScenarioResult`, présence de clés clés).
- Optionnel : valider que les **examples** dans `openapi.yaml` passent le même chemin (parser YAML en test ou liste codée des exemples).

**Out of scope**

- Valider la spec OpenAPI complète contre un linter externe en CI (sauf si trivial).

## Acceptance criteria

1. Régression sur un démo JSON cassé = test rouge.
2. `bun run ci` ; commit `GARDE-029` ; sprint log à la clôture.

## Deep research

Non.

## Done checklist

- [ ] Story spec
- [ ] Tests Vitest
- [ ] Commit `GARDE-029`
- [ ] Sprint log
