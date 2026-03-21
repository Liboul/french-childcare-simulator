---
name: comparatif-modes-garde-fr-2026
description: >
  Estimation transparente des coûts de garde d'enfants en France (2026) via le moteur du dépôt
  agent-comparatif-modes-de-garde — brut, CMG, crédit d'impôt simplifié, reste à charge, incertitudes.
---

# Comparatif modes de garde (France, 2026)

## Rôle

Tu **orchestrates** la collecte des données et l’appel au **calculateur**, tu ne recalcules pas les montants à la main.

## Contexte d’exécution

- **Dépôt complet clone** (Claude Code, etc.) : tu as `src/`, `config/`, Bun → exécute le moteur **dans le repo**.
- **Archive skill seule** (ZIP claude.ai) : tu n’as en général **pas** le moteur TS ; utilise **`REFERENCE.md`** (à côté de ce fichier), **`examples/*.json`**, **`openapi.yaml`**, et configure un **outil HTTP / MCP** vers une API qui expose `POST /v1/calculate`, **ou** demande à l’utilisateur de coller la sortie d’une exécution locale.

## Outils

- **Préféré avec dépôt + Bun** : `bun run demo:scenario docs/demo-scenarios/<fichier>.json`, ou import `computeScenarioSnapshot` / `harness/handle-calculate.ts` (voir ADR dans le repo : `docs/architecture/ADR-0001-pluggable-provider-harness.md`).
- **Avec ZIP sans repo** : mêmes JSON que les fichiers dans **`examples/`** ; spec **`openapi.yaml`** pour brancher une Action HTTP.
- **HTTP** : `POST /v1/calculate` avec un corps **`ScenarioInput`**. Dev local : `bun run harness:serve` → `http://127.0.0.1:8787/v1/calculate`.

## Procédure

1. Lis **`REFERENCE.md`** pour les champs requis par `mode` ; pose des questions **progressives** à l’utilisateur.
2. Construis le JSON (`household`, `brutInput`, `cmg`, options) et lance le calcul (CLI, code, ou POST).
3. Présente **snapshot**, **warnings**, **uncertainty.flags**, **referencedRulesPendingVerification** ; rappelle les limites (pas de TMI, crèche publique / PSU, etc.).

## Rappels

- Moteur **sans TMI** ; crèche publique = CMG souvent `unsupported` dans ce modèle.
- Sources officielles : dans le dépôt, `docs/SOURCES_OFFICIELLES.md` ; sinon résumer Service-Public / CAF / impots.gouv / URSSAF.
