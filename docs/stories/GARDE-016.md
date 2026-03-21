# GARDE-016 — Harness fournisseur (API + OpenAI + ébauche Claude)

| Field     | Value                                                                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Epic**  | E4 — Packaging                                                                                                                                   |
| **Links** | [ADR-0001](../architecture/ADR-0001-pluggable-provider-harness.md), [DR-05](../research/DR-05-PROVIDER-HARNESS.md), **GARDE-012**, **GARDE-017** |

## User / product value

Un **harness** réutilisable permet de brancher le moteur sur des **Actions GPT** (OpenAPI) ou une **Skill Claude** : instructions, schéma d’outil, exemples de prompts, serveur HTTP de développement. Le **code métier** reste dans `src/` ; le dossier `harness/` ne contient que l’enveloppe.

## Scope

**In scope**

- `harness/handle-calculate.ts` : charge le pack, expose `calculateScenario(input)` → `ScenarioResult`.
- `harness/server.ts` : `Bun.serve` — `GET /health`, `POST /v1/calculate` (JSON `ScenarioInput`), CORS simple pour essais locaux.
- `harness/openapi.yaml` : contrat pour **Custom GPT / Action** (corps = `ScenarioInput`, réponse = résultat scénario).
- `harness/instructions/gpt-custom-instructions.fr.md` + `harness/prompts/example-user-messages.fr.md`.
- `harness/claude/SKILL.md` : skill minimal (instructions + lien OpenAPI / démo).
- `harness/README.md` : démarrage, `bun run harness:serve`, avertissements sécurité (pas d’auth en dev).
- Test unitaire sur `calculateScenario` (fixture démo).
- `tsconfig` + `lint` + `package.json` script ; sprint log.

**Out of scope**

- Déploiement cloud, OAuth production, review GPT Store, packaging ZIP Skill final.

## Acceptance criteria

1. `bun run harness:serve` démarre ; `curl -s localhost:8787/health` → JSON ok.
2. `POST /v1/calculate` avec un JSON démo retourne `snapshot.mode` cohérent.
3. `bun run ci` vert ; commit `GARDE-016`.

## Deep research

Couvert par **DR-05** + **ADR-0001**.

## Done checklist

- [x] Story spec
- [x] Harness + OpenAPI + prompts + test
- [x] Sprint log
- [x] Commit `GARDE-016`
