# GARDE-026 — Versioning dans les réponses API

| Field     | Value                                                                                       |
| --------- | ------------------------------------------------------------------------------------------- |
| **Epic**  | E2 / E4                                                                                     |
| **Links** | `config/rules.fr-2026.json`, **GARDE-005**, `harness/handle-calculate.ts`, `ScenarioResult` |

## User / product value

Chaque réponse permet d’identifier **quel barème** et **quelle build** ont servi au calcul — essentiel pour audits et support.

## Scope

**In scope**

- Champs dédiés dans `ScenarioResult` (ex. `engineVersion`, `rulePackId` / hash / date) — noms à figer à l’impl.
- Renseignés dans `calculateScenario` / agrégat ; visibles dans OpenAPI + exemples.

**Out of scope**

- CI de publication semver automatique (peut croiser **GARDE-028**).

## Acceptance criteria

1. Les réponses `POST /v1/calculate` incluent les identifiants convenus.
2. Au moins un test d’intégration vérifie leur présence.
3. `bun run ci` ; commit `GARDE-026` ; sprint log à la clôture.

## Deep research

Non.

## Done checklist

- [ ] Story spec
- [ ] Implémentation + OpenAPI + tests
- [ ] Commit `GARDE-026`
- [ ] Sprint log
