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

- **HTTP POST** vers l’API du projet : `POST /v1/calculate` avec un corps JSON **`ScenarioInput`**.
  - Spécification : fichier `harness/openapi.yaml` à la racine du repo.
  - Exemples de corps : `docs/demo-scenarios/*.json`.
- **Local** : `bun run harness:serve` puis `POST http://127.0.0.1:8787/v1/calculate`.

## Procédure

1. Vérifier que l’utilisateur a fourni assez d’information pour remplir `household`, `brutInput` (selon `mode`), et `cmg` comme dans `src/scenario/types.ts`.
2. Construire le JSON et l’envoyer au endpoint ; transmettre la réponse en français avec **snapshot**, **warnings**, **uncertainty.flags** et **referencedRulesPendingVerification**.
3. Citer que les règles incertaines portent la mention `todoVerify` dans le pack quand c’est pertinent.

## Rappels

- Moteur **sans TMI** ; crèche publique = CMG souvent `unsupported` dans ce modèle.
- Pour toute décision juridique ou fiscale définitive, renvoyer vers les sources officielles (voir `docs/SOURCES_OFFICIELLES.md`).
