# GARDE-024 — Profils de packaging skill (repo vs ZIP + HTTP)

| Field     | Value                                                                        |
| --------- | ---------------------------------------------------------------------------- |
| **Epic**  | E4 — Packaging                                                               |
| **Links** | **GARDE-018**, `scripts/package-harness-skill.ts`, `docs/shipping/README.md` |

## User / product value

Deux publics distincts (développeur avec clone **vs** utilisateur avec ZIP sur hôte Agent Skills) ont des **instructions et artefacts** qui ne se mélangent pas.

## Scope

**In scope**

- Documenter **Piste A** (symlink / `~/.claude/skills`) et **Piste B** (ZIP + API) avec prérequis explicites.
- Optionnel : **deux ZIP** ou **même ZIP** avec `SKILL-CODE.md` vs `SKILL-WEB.md` — à trancher ; au minimum README dans le bundle.
- Mise à jour **shipping** + **harness README**.

**Out of scope**

- Hébergement managé du binaire.

## Acceptance criteria

1. `docs/shipping/README.md` contient une sous-section **« Choisir son profil »** avec tableau décisionnel.
2. `bun run package:harness-skill` reste fonctionnel ; si double artefact, script ou doc d’invocation claire.
3. `bun run ci` ; commit `GARDE-024` ; sprint log à la clôture.

## Deep research

Non.

## Done checklist

- [ ] Story spec
- [ ] Doc + ajustements packaging si nécessaire
- [ ] Commit `GARDE-024`
- [ ] Sprint log
