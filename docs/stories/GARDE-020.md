# GARDE-020 — Validation `ScenarioInput` sur l’API harness

| Field     | Value                                                          |
| --------- | -------------------------------------------------------------- |
| **Epic**  | E4 — Packaging                                                 |
| **Links** | **GARDE-016**, `harness/openapi.yaml`, `src/scenario/types.ts` |

## User / product value

Les clients HTTP (Custom GPT, MCP, scripts) reçoivent des **erreurs structurées** (champs manquants / invalides) au lieu d’échecs opaques, ce qui permet à l’agent de **reposer les bonnes questions**.

## Scope

**In scope**

- Validation runtime du corps `POST /v1/calculate` (Zod ou équivalent aligné sur les types métier).
- Réponses **4xx** avec payload JSON stable (`error`, `details` / `issues` — à figer dans la story d’impl).
- Mise à jour **OpenAPI** (schémas d’erreur + exemples).

**Out of scope**

- Auth (voir **GARDE-025**).

## Acceptance criteria

1. JSON invalide → **400** ; JSON valide mais métier incomplet → **422** (ou code convenu) avec liste exploitable.
2. Les démos existantes passent toujours.
3. Test d’intégration harness minimal ; `bun run ci` ; sprint log à la clôture.

## Deep research

Non.

## Done checklist

- [ ] Story spec
- [ ] Implémentation + tests + OpenAPI
- [ ] Commit `GARDE-020`
- [ ] Sprint log
