# GARDE-022 — Codes et messages pour chemins non supportés

| Field     | Value                                                                          |
| --------- | ------------------------------------------------------------------------------ |
| **Epic**  | E2 / E4                                                                        |
| **Links** | CMG / modes (`unsupported`, `ineligible`), **GARDE-011**, harness instructions |

## User / product value

Quand le moteur ne couvre pas un cas (ex. PSU, crèche publique), l’utilisateur et le harness reçoivent une **explication actionnable** (code stable, lien Service-Public / CAF / note repo).

## Scope

**In scope**

- Énumération ou catalogue de **codes** + libellés FR + URL doc optionnelle pour les principaux refus / limitations.
- Surface dans `ScenarioResult` (champ dédié ou extension de `warnings` / `uncertainty`) — à trancher à l’impl sans casser les clients existants de façon non documentée.
- Mise à jour **REFERENCE.md** / **INTAKE** si **GARDE-023** existe.

**Out of scope**

- Implémenter tous les modes manquants.

## Acceptance criteria

1. Au moins **3** scénarios de limitation documentés avec code stable et test ou snapshot.
2. Les instructions skill/GPT mentionnent comment interpréter ces codes.
3. `bun run ci` ; commit `GARDE-022` ; sprint log à la clôture.

## Deep research

Non (reprendre liens déjà dans `docs/SOURCES_OFFICIELLES.md`).

## Done checklist

- [ ] Story spec
- [ ] Implémentation + doc harness
- [ ] Commit `GARDE-022`
- [ ] Sprint log
