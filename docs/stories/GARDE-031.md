# GARDE-031 — CI : vérification du ZIP skill Claude

| Field     | Value                                            |
| --------- | ------------------------------------------------ |
| **Epic**  | E0 — Foundation                                  |
| **Links** | `scripts/package-claude-skill.ts`, **GARDE-024** |

## User / product value

Le pipeline garantit que l’artefact publiable **contient toujours** `SKILL.md`, `REFERENCE.md`, `openapi.yaml`, et les exemples.

## Scope

**In scope**

- Étape CI (GitHub Actions ou script `bun run …`) : exécuter `package:claude-skill`, ouvrir le ZIP (outil CLI `unzip -l` ou lib), vérifier la liste des fichiers attendus.

**Out of scope**

- Signature / notarisation du ZIP.

## Acceptance criteria

1. CI rouge si un fichier obligatoire disparaît du bundle.
2. `bun run ci` inclut cette étape (ou job dédié documenté).
3. Commit `GARDE-031` ; sprint log à la clôture.

## Deep research

Non.

## Done checklist

- [ ] Story spec
- [ ] Script + workflow CI
- [ ] Commit `GARDE-031`
- [ ] Sprint log
