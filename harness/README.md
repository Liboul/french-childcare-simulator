# Harness (GARDE-016)

Enveloppe **hors moteur** : HTTP de dev, **OpenAPI** pour Actions GPT, instructions et **skill harness** (format Agent Skills).  
Décision d’architecture : [ADR-0001](../docs/architecture/ADR-0001-pluggable-provider-harness.md).

**→ Livraison par fournisseur (Anthropic / OpenAI / Google, etc.) :** [`docs/shipping/README.md`](../docs/shipping/README.md) (**GARDE-018**).  
**ZIP harness skill :** `bun run package:harness-skill` → `dist/comparatif-modes-garde-fr-2026-skill.zip` (inclut **`scripts/simulate.mjs`**, sans `openapi.yaml` dans l’archive — **GARDE-035**).  
**Cursor (skill projet) :** `bun run setup:cursor-harness-skill` — voir [`docs/shipping/README.md`](../docs/shipping/README.md) § Cursor.

## Faut-il lancer l’API ?

**Souvent non.** Si l’outil (IDE agent avec clone — Cursor, Cowork, etc.) a **le clone du dépôt** et **Bun**, le chemin recommandé est d’**exécuter le moteur dans le repo** : `bun run demo:scenario <fichier.json>`, imports depuis `src/`, ou `calculateScenario` via [`handle-calculate.ts`](./handle-calculate.ts) dans un script / test — **sans** `harness:serve`.

**Oui, ou équivalent hébergé**, quand le canal **ne peut pas** tourner le code localement : **Custom GPT** (Actions HTTPS), utilisateurs **sans** dev environment, ou tout client qui consomme uniquement une **API documentée** (`openapi.yaml`).

Le détail (décision 5) est dans l’[ADR-0001 § Décision](../docs/architecture/ADR-0001-pluggable-provider-harness.md).

## Démarrage API locale

```bash
bun run harness:serve
```

- Santé : `GET http://127.0.0.1:8787/health`
- Schéma JSON : `GET http://127.0.0.1:8787/v1/scenario/schema`
- Calcul : `POST http://127.0.0.1:8787/v1/calculate` avec un JSON **`ScenarioInput`** (voir `docs/demo-scenarios/*.json`). Corps invalide → **422** `validation_failed` + `issues`.

Si **`HARNESS_API_KEY`** est défini, envoyer **`X-Api-Key`** ou **`Authorization: Bearer`**. Voir [`docs/shipping/PRODUCTION-HARNESS.md`](../docs/shipping/PRODUCTION-HARNESS.md).

Variable optionnelle : `HARNESS_PORT` (défaut `8787`).

## OpenAPI → Custom GPT Action

Fichier : [`openapi.yaml`](./openapi.yaml). Dans ChatGPT (Create GPT → Actions), importer ce schéma ou coller l’URL une fois le serveur exposé publiquement (tunnel ngrok, etc.).

**Sécurité :** sans **`HARNESS_API_KEY`**, pas d’authentification ; avec la variable, voir [`PRODUCTION-HARNESS.md`](../docs/shipping/PRODUCTION-HARNESS.md). Toujours TLS devant le service en production.

## Fichiers utiles

| Fichier                                                                                      | Rôle                                                    |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| [`handle-calculate.ts`](./handle-calculate.ts)                                               | Logique partagée HTTP / tests                           |
| [`server.ts`](./server.ts)                                                                   | `Bun.serve`                                             |
| [`instructions/gpt-custom-instructions.fr.md`](./instructions/gpt-custom-instructions.fr.md) | Instructions système suggérées pour un GPT              |
| [`prompts/example-user-messages.fr.md`](./prompts/example-user-messages.fr.md)               | Exemples utilisateur                                    |
| [`skill/SKILL.md`](./skill/SKILL.md)                                                         | Skill harness — instructions (embarqué dans le ZIP)     |
| [`skill/REFERENCE.md`](./skill/REFERENCE.md)                                                 | Champs `ScenarioInput` + limites (embarqué dans le ZIP) |
| [`INTAKE.md`](./INTAKE.md)                                                                   | Playbook d’entretien (ordre des questions)              |
| [`scenario-input.schema.json`](./scenario-input.schema.json)                                 | JSON Schema `ScenarioInput`                             |
