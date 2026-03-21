# Quickstart — Gemini (Gem + function calling)

Objectif : une **fonction** « calcul scénario » qui POSTe le même JSON que l’OpenAPI du repo.

1. Héberge **`POST /v1/calculate`** en **HTTPS** (même corps / réponse que [`harness/openapi.yaml`](../../harness/openapi.yaml)).
2. Dans **AI Studio** (ou équivalent), déclare une fonction dont les paramètres correspondent à un **`ScenarioInput`** (tu peux t’appuyer sur [`harness/scenario-input.schema.json`](../../harness/scenario-input.schema.json) pour la forme).
3. Instructions système du Gem : reprendre l’esprit de [`harness/INTAKE.md`](../../harness/INTAKE.md) + limites moteur (pas de TMI, PSU, etc.).

Quotas et clés : documentation Google Cloud / AI Studio pour ton projet.
