# Harness (GARDE-016)

Enveloppe **hors moteur** : HTTP de dev, **OpenAPI** pour Actions GPT, instructions et ébauche **Claude Skill**.  
Décision d’architecture : [ADR-0001](../docs/architecture/ADR-0001-pluggable-provider-harness.md).

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

| Fichier                                                                                      | Rôle                                       |
| -------------------------------------------------------------------------------------------- | ------------------------------------------ |
| [`handle-calculate.ts`](./handle-calculate.ts)                                               | Logique partagée HTTP / tests              |
| [`server.ts`](./server.ts)                                                                   | `Bun.serve`                                |
| [`instructions/gpt-custom-instructions.fr.md`](./instructions/gpt-custom-instructions.fr.md) | Instructions système suggérées pour un GPT |
| [`prompts/example-user-messages.fr.md`](./prompts/example-user-messages.fr.md)               | Exemples utilisateur                       |
| [`claude/SKILL.md`](./claude/SKILL.md)                                                       | Skill minimal Claude                       |
