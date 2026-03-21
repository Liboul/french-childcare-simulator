# GARDE-033 — Modèles d’issues GitHub

| Field     | Value                                        |
| --------- | -------------------------------------------- |
| **Epic**  | E0 — Foundation                              |
| **Links** | **GARDE-032**, `docs/SOURCES_OFFICIELLES.md` |

## User / product value

Les signalements incluent **reproduction**, **sources officielles**, et **version** du moteur — réduit les allers-retours.

## Scope

**In scope**

- `.github/ISSUE_TEMPLATE/` : au minimum **bug calcul** (JSON d’entrée, sortie attendue vs obtenue, URL Service-Public / CAF / impots.gouv) et **demande de règle / mode**.
- Optionnel : issue **harness** (canal, OpenAPI, erreur HTTP).

**Out of scope**

- Discussions forum.

## Acceptance criteria

1. Création d’issue depuis GitHub propose les modèles.
2. Chaque modèle rappelle l’interdiction de se substituer à un conseil juridique personnalisé (une ligne).
3. `bun run ci` inchangé ou doc-only ; commit `GARDE-033` ; sprint log à la clôture.

## Deep research

Non.

## Done checklist

- [ ] Story spec
- [ ] Templates YAML
- [ ] Commit `GARDE-033`
- [ ] Sprint log
