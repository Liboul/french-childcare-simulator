# Livrer le projet comme **Claude Skill** (Anthropic)

Ce guide est le pas-à-pas pour **ce dépôt**. Contexte produit : [ADR-0001](../architecture/ADR-0001-pluggable-provider-harness.md), synthèse [§ Anthropic](README.md#anthropic-claude).

---

## Choisir un canal

| Canal                        | Moteur disponible ?                                                    | Complexité |
| ---------------------------- | ---------------------------------------------------------------------- | ---------- |
| **Claude Code** + clone repo | Oui (`bun`, `demo:scenario`, TS)                                       | Faible     |
| **claude.ai** Skill (ZIP)    | Non, sauf API distante ou code embarqué selon les capacités du produit | Moyenne    |
| **MCP / outil HTTP**         | Oui, si tu héberges `POST /v1/calculate`                               | Moyenne    |

---

## Piste recommandée — **Claude Code** (workspace = ce repo)

1. **Prérequis** : [Bun](https://bun.sh) installé, dépôt cloné.
2. **Installer les dépendances** : à la racine du repo, `bun install`.
3. **Vérifier** : `bun run ci` ; optionnel `bun run demo:scenario docs/demo-scenarios/nounou-domicile-couple-2026.json`.
4. **Installer le Skill** : copier le dossier `harness/claude/` (celui qui contient `SKILL.md`) vers le répertoire des skills Claude Code. Le nom du dossier peut être `comparatif-modes-garde-fr-2026` pour correspondre au `name` du frontmatter.
   - Emplacement typique : `~/.claude/skills/comparatif-modes-garde-fr-2026/` (vérifier la [doc Anthropic](https://docs.anthropic.com) / aide Claude Code pour ta version).
5. **Contenu du dossier** : au minimum `SKILL.md` ; recommandé : inclure aussi `reference.md` (même répertoire) pour l’intake JSON sans ouvrir le repo.
6. **Usage** : ouvrir ce repo dans Claude Code, activer le skill ; le modèle suit `SKILL.md` (exécution via `bun run demo:scenario` ou import `harness/handle-calculate.ts`).

Les liens relatifs dans `SKILL.md` (`../../docs/...`) supposent que **le workspace est la racine du dépôt** — c’est le cas normal sous Claude Code.

---

## Piste **claude.ai** — upload d’un ZIP Skill

1. **Construire l’archive** (depuis la racine du repo) :

   ```bash
   bun run skill:zip
   ```

   Cela produit `dist/comparatif-modes-garde-fr-2026-skill.zip` avec `SKILL.md` et `reference.md`.

2. Dans **Claude** (web) : réglages → Capabilities → Skills (libellés exacts selon l’UI actuelle) → **importer / uploader** le ZIP.

3. **Limitation** : sans le reste du dépôt, le skill **ne contient pas** le moteur TypeScript. Pour un calcul réel, il faut soit :
   - **héberger** l’API (`bun run harness:serve` derrière HTTPS + auth en prod), et documenter l’URL dans les instructions du GPT/skill ou dans `SKILL.md` une fois édité pour ton déploiement ; soit
   - utiliser **Claude Code** avec le repo (piste recommandée).

4. **Personnaliser** : après déploiement d’une API, éditer `SKILL.md` (copie locale dans `harness/claude/`) pour indiquer l’URL de base HTTPS ; régénérer le ZIP avec `bun run skill:zip`.

---

## Piste **API + MCP / HTTP** (Claude appelle ton backend)

1. Exposer **`POST /v1/calculate`** (et idéalement `GET /health`) en **HTTPS** avec protection (clé API, rate limit). Contrat : [`harness/openapi.yaml`](../../harness/openapi.yaml).
2. Configurer un connecteur **MCP** ou l’outil HTTP côté Anthropic pour pointer vers cette URL (voir doc MCP Anthropic).
3. Le skill peut se limiter à : « quand tu as le JSON `ScenarioInput`, appelle l’outil `calculate` » — la logique métier reste sur ton serveur.

---

## Fichiers du skill dans ce repo

| Fichier                                                            | Rôle                                                |
| ------------------------------------------------------------------ | --------------------------------------------------- |
| [`harness/claude/SKILL.md`](../../harness/claude/SKILL.md)         | Manifest + instructions (YAML frontmatter requis)   |
| [`harness/claude/reference.md`](../../harness/claude/reference.md) | Intake / champs `ScenarioInput` sans ouvrir le code |

---

## Dépannage

- **« Le skill ne calcule rien »** (web) : normal si aucune API n’est branchée ; utiliser Claude Code + repo ou déployer le harness.
- **Erreur Bun / module** : `bun install` à la racine ; Bun dans le PATH de l’agent.
- **Chemins cassés dans le skill** : sous Claude Code, la racine du workspace doit être le dépôt ; les `../../docs/...` du `SKILL.md` pointent depuis `harness/claude/`.
