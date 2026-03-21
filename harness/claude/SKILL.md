---
name: comparatif-modes-garde-fr-2026
description: >
  Estimation transparente des coûts de garde d'enfants en France (2026) via le moteur du dépôt
  agent-comparatif-modes-de-garde — brut, CMG, crédit d'impôt simplifié, reste à charge, incertitudes.
---

# Comparatif modes de garde (France, 2026)

## Rôle

Tu **orchestrates** la collecte des données et l’appel au **calculateur**, tu ne recalcules pas les montants à la main.

## Outils

- **Préféré si tu as le dépôt et Bun** : exécuter le moteur **dans le repo** — `bun run demo:scenario docs/demo-scenarios/<fichier>.json`, ou script / import utilisant `computeScenarioSnapshot` / `harness/handle-calculate.ts`. Pas besoin de serveur HTTP (voir [ADR-0001](../../docs/architecture/ADR-0001-pluggable-provider-harness.md), décision 5).
- **HTTP (optionnel)** : `POST /v1/calculate` avec un corps **`ScenarioInput`** quand le runtime ne peut pas exécuter le code (ex. GPT Action distante).
  - Spec : `harness/openapi.yaml` ; exemples JSON : `docs/demo-scenarios/*.json`.
  - Dev local : `bun run harness:serve` puis `POST http://127.0.0.1:8787/v1/calculate`.

## Référence intake (sans parcourir le repo)

Si le workspace ne contient pas `src/`, t’appuier sur **`reference.md`** (dans ce dossier skill) pour les champs `ScenarioInput` et un exemple JSON.

## Procédure

1. Vérifier que l’utilisateur a fourni assez d’information pour remplir `household`, `brutInput` (selon `mode`), et `cmg` comme dans `src/scenario/types.ts` (ou `reference.md`).
2. Construire le JSON et **lancer le calcul** (CLI, code, ou POST selon l’environnement) ; transmettre la réponse en français avec **snapshot**, **warnings**, **uncertainty.flags** et **referencedRulesPendingVerification**.
3. Citer que les règles incertaines portent la mention `todoVerify` dans le pack quand c’est pertinent.

## Rappels

- Moteur **sans TMI** ; crèche publique = CMG souvent `unsupported` dans ce modèle.
- Pour toute décision juridique ou fiscale définitive, renvoyer vers les sources officielles (voir `docs/SOURCES_OFFICIELLES.md`).
