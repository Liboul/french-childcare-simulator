# GARDE-023 — Playbook d’intake pour le harness

| Field     | Value                                                                                                          |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| **Epic**  | E4 — Packaging                                                                                                 |
| **Links** | `harness/claude/SKILL.md`, `harness/claude/REFERENCE.md`, `harness/instructions/gpt-custom-instructions.fr.md` |

## User / product value

Réduit la variance entre modèles : **ordre des questions**, champs obligatoires par `mode`, formulations FR, et rappels des limites moteur.

## Scope

**In scope**

- Nouveau fichier **`harness/INTAKE.md`** (ou chemin équivalent) : sections par mode, cumul CMG, options fiscales optionnelles.
- Mise à jour **SKILL.md**, **REFERENCE.md** (lien court), **instructions GPT** pour renvoyer vers ce playbook.
- Script **`package:claude-skill`** inclut le fichier dans le ZIP si pertinent.

**Out of scope**

- Nouvelle logique métier dans le moteur.

## Acceptance criteria

1. Un intégrateur peut mener un entretien complet **sans ouvrir** `src/scenario/types.ts` (types restent la vérité technique, playbook la vérité conversationnelle).
2. Les trois démos repo sont référencées comme gabarits.
3. `bun run ci` ; commit `GARDE-023` ; sprint log à la clôture.

## Deep research

Non.

## Done checklist

- [ ] Story spec
- [ ] `INTAKE.md` + mises à jour skill / GPT + packaging
- [ ] Commit `GARDE-023`
- [ ] Sprint log
