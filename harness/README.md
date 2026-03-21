# Harness (GARDE-016)

Enveloppe **hors moteur** : HTTP de dev, **OpenAPI** pour Actions GPT, instructions et ébauche **Claude Skill**.  
Décision d’architecture : [ADR-0001](../docs/architecture/ADR-0001-pluggable-provider-harness.md).

**→ Livraison par fournisseur (Claude / ChatGPT / Gemini) :** [`docs/shipping/README.md`](../docs/shipping/README.md) (**GARDE-018**).  
**ZIP skill Claude :** `bun run package:claude-skill` → `dist/comparatif-modes-garde-fr-2026-skill.zip`.

## Faut-il lancer l’API ?

**Souvent non.** Si l’outil (Claude Code, Cursor, Cowork, etc.) a **le clone du dépôt** et **Bun**, le chemin recommandé est d’**exécuter le moteur dans le repo** : `bun run demo:scenario <fichier.json>`, imports depuis `src/`, ou `calculateScenario` via [`handle-calculate.ts`](./handle-calculate.ts) dans un script / test — **sans** `harness:serve`.

**Oui, ou équivalent hébergé**, quand le canal **ne peut pas** tourner le code localement : **Custom GPT** (Actions HTTPS), utilisateurs **sans** dev environment, ou tout client qui consomme uniquement une **API documentée** (`openapi.yaml`).

Le détail (décision 5) est dans l’[ADR-0001 § Décision](../docs/architecture/ADR-0001-pluggable-provider-harness.md).

## Démarrage API locale

```bash
bun run harness:serve
```

- Santé : `GET http://127.0.0.1:8787/health`
- Calcul : `POST http://127.0.0.1:8787/v1/calculate` avec un JSON **`ScenarioInput`** (voir `docs/demo-scenarios/*.json`).

Variable optionnelle : `HARNESS_PORT` (défaut `8787`).

## OpenAPI → Custom GPT Action

Fichier : [`openapi.yaml`](./openapi.yaml). Dans ChatGPT (Create GPT → Actions), importer ce schéma ou coller l’URL une fois le serveur exposé publiquement (tunnel ngrok, etc.).

**Sécurité :** le serveur ci-dessus **n’a pas d’authentification** ; ne l’exposez pas sur Internet sans reverse-proxy + clé API ou équivalent.

## Fichiers utiles

| Fichier                                                                                      | Rôle                                                    |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| [`handle-calculate.ts`](./handle-calculate.ts)                                               | Logique partagée HTTP / tests                           |
| [`server.ts`](./server.ts)                                                                   | `Bun.serve`                                             |
| [`instructions/gpt-custom-instructions.fr.md`](./instructions/gpt-custom-instructions.fr.md) | Instructions système suggérées pour un GPT              |
| [`prompts/example-user-messages.fr.md`](./prompts/example-user-messages.fr.md)               | Exemples utilisateur                                    |
| [`claude/SKILL.md`](./claude/SKILL.md)                                                       | Skill Claude (instructions)                             |
| [`claude/REFERENCE.md`](./claude/REFERENCE.md)                                               | Champs `ScenarioInput` + limites (embarqué dans le ZIP) |
