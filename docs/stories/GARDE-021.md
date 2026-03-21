# GARDE-021 — Schéma JSON `ScenarioInput` exposé pour outils

| Field     | Value                                                                                 |
| --------- | ------------------------------------------------------------------------------------- |
| **Epic**  | E4 — Packaging                                                                        |
| **Links** | **GARDE-020** (recommandé), `harness/openapi.yaml`, Actions OpenAI / function calling |

## User / product value

Les intégrateurs peuvent **générer ou valider** des bindings (GPT Actions, MCP, clients) à partir d’une **source de vérité** versionnée dans le repo.

## Scope

**In scope**

- Artefact **JSON Schema** (ou équivalent) pour `ScenarioInput`, généré ou maintenu avec procédure de non-drift.
- Exposition : **fichier** sous `harness/` et/ou route **`GET`** sur le serveur harness (décision dans l’impl), documentée dans `harness/README.md` et `docs/shipping/`.

**Out of scope**

- Générateur de formulaire UI.

## Acceptance criteria

1. Le schéma couvre au minimum la discrimination `brutInput.mode` et les champs `household` / `cmg` alignés sur le moteur.
2. L’OpenAPI ou la doc indique **où** consommer le schéma.
3. `bun run ci` ; commit `GARDE-021` ; sprint log à la clôture.

## Deep research

Non.

## Done checklist

- [ ] Story spec
- [ ] Artefact + doc (+ endpoint si retenu)
- [ ] Commit `GARDE-021`
- [ ] Sprint log
