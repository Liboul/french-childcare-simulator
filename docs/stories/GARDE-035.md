# GARDE-035 — Skill Claude : moteur embarqué (`simulate.mjs`), sans API dans le ZIP

| Field     | Value                                                                                                     |
| --------- | --------------------------------------------------------------------------------------------------------- |
| **Epic**  | E4 — Harness / livraison                                                                                  |
| **Links** | **GARDE-016**, **GARDE-024**, **GARDE-031**, `scripts/package-claude-skill.ts`, `harness/claude/SKILL.md` |

## User / product value

Sur **claude.ai**, un skill uploadé en ZIP ne contenait **pas** le moteur : seules des instructions pointaient vers une API HTTP ou un clone du dépôt. Les utilisateurs sans backend ne pouvaient pas obtenir de simulation **déterministe** cohérente avec les tests du repo.

Ce story livre un **bundle Node** (`scripts/simulate.mjs`) dans l’archive skill, aligné sur `calculateScenario` / `harness/handle-calculate.ts`, et renforce le prompt pour que Claude **exécute obligatoirement** ce script plutôt que d’inventer des montants. L’**OpenAPI** n’est plus embarquée dans le ZIP Claude (le fichier reste dans le repo pour **Custom GPT** et intégrations HTTP).

## Spécification technique

### Build

- **Entrée** : `scripts/claude-skill-simulate-entry.ts` — lit un chemin fichier ou `-` (stdin), parse JSON, appelle `calculateScenario`, imprime le résultat ou `validation_failed` + `issues`.
- **Commande** : `bun build … --target node --packages bundle` → `dist/claude-skill-runner/simulate.mjs` (zod + règles JSON inlined).
- **Script** : `bun run build:claude-skill-runner` ; `package:claude-skill` **rebuild** le runner puis assemble le dossier skill.

### Contenu du ZIP (delta)

- **Ajout** : `comparatif-modes-garde-fr-2026/scripts/simulate.mjs`.
- **Retrait** : `openapi.yaml` (hors archive skill ; inchangé dans `harness/openapi.yaml`).

### SKILL.md

- `description` YAML **≤ 200 caractères** (contrainte claude.ai).
- Sections explicites : **interdiction** de chiffrer sans exécuter `simulate.mjs` ; procédure **node scripts/simulate.mjs** ; comparaison multi-modes = **plusieurs** exécutions.

### Hors scope

- Suppression du serveur `harness/server.ts` ou d’`openapi.yaml` **dans le repo** (toujours utiles pour GPT / dev).
- Portage Python ou hébergement SaaS du harness.

## Acceptance criteria

1. `bun run package:claude-skill` produit un ZIP contenant **`scripts/simulate.mjs`** et **pas** `openapi.yaml`.
2. `node scripts/simulate.mjs <demo.json>` (extrait du ZIP) reproduit un calcul cohérent (smoke test CI).
3. `SKILL.md` / `REFERENCE.md` / quickstarts **Anthropic** ne présentent plus l’API HTTP comme chemin principal pour le skill ZIP.
4. CI **GARDE-031** mise à jour : assert sur `simulate.mjs` au lieu d’`openapi.yaml` dans le ZIP.

## Deep research

Non (décision produit + doc Anthropic skills `scripts/` déjà référencée en interne).

## Done checklist

- [x] Story spec
- [x] Build + packaging + doc + CI
- [x] Commit `GARDE-035`
- [x] Sprint log : ligne **GARDE-035** dans [`SPRINT_PLAN.md`](../SPRINT_PLAN.md) (table stories livrées)
