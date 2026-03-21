# Quickstart — Claude Code + dépôt

Objectif : premier calcul en **moins de cinq minutes** avec le moteur **dans** le clone.

1. **Prérequis** : [Bun](https://bun.sh), Git, accès à ce repo.
2. `git clone …` puis `cd agent-comparatif-modes-de-garde` et `bun install`.
3. (Optionnel) Lier le skill : `ln -sf "$(pwd)/harness/claude" ~/.claude/skills/comparatif-modes-garde-fr-2026` — vérifier le chemin des skills sur la [doc Anthropic](https://docs.anthropic.com) actuelle.
4. Lancer un scénario :  
   `bun run demo:scenario docs/demo-scenarios/nounou-domicile-couple-2026.json`
5. API locale (pour tester comme une Action) :  
   `bun run harness:serve` puis `curl -s http://127.0.0.1:8787/health` et `POST /v1/calculate` avec le même JSON.

Ensuite : [`INTAKE.md`](../../harness/INTAKE.md) pour guider une conversation, [`../SOURCES_OFFICIELLES.md`](../SOURCES_OFFICIELLES.md) pour les citations.
