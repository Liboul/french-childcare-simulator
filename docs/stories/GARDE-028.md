# GARDE-028 — CHANGELOG barème + artifacts harness

| Field     | Value                                                         |
| --------- | ------------------------------------------------------------- |
| **Epic**  | E1 / E4                                                       |
| **Links** | `config/rules.*.json`, **GARDE-026**, `package:harness-skill` |

## User / product value

Les changements de **chiffres officiels** et de **packaging** sont traçables pour utilisateurs et reviewers.

## Scope

**In scope**

- Fichier **`CHANGELOG.md`** (ou `docs/CHANGELOG.md`) avec sections **Rules pack** / **Engine** / **Harness & skill**.
- Règles de version : quand bump **majeur** (rupture JSON) vs **mineur** (nouveaux champs optionnels) — texte dans le CHANGELOG ou `CONTRIBUTING`.
- Première entrée reflétant l’état actuel ou « baseline ».

**Out of scope**

- Automatisation release GitHub complète.

## Acceptance criteria

1. Un lecteur comprend **ce qui change** entre deux commits touchant `config/` ou le harness.
2. Lien depuis **README** racine ou `docs/` (une ligne).
3. `bun run ci` ; commit `GARDE-028` ; sprint log à la clôture.

## Deep research

Non.

## Done checklist

- [ ] Story spec
- [ ] CHANGELOG + lien README
- [ ] Commit `GARDE-028`
- [ ] Sprint log
