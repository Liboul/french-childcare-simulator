# GARDE-030 — Invariants monétaires (property / ciblés)

| Field     | Value                                                            |
| --------- | ---------------------------------------------------------------- |
| **Epic**  | E0 / E2                                                          |
| **Links** | **GARDE-014**, modules `childcare/`, `tax-credits/`, `scenario/` |

## User / product value

Renforce la confiance : **RAC** cohérent, pas de valeurs impossibles sur des familles de paramètres contrôlées.

## Scope

**In scope**

- Petite batterie **property-based** (fast-check ou génération manuelle) **ou** suite élargie de cas ciblés documentés.
- Invariants explicites dans le test (ex. plafonds crédit, monotonie là où le métier l’exige, RAC ≥ 0 si c’est la règle produit).

**Out of scope**

- Preuve formelle complète du code fiscal.

## Acceptance criteria

1. Au moins **un** invariant non déjà couvert par la matrice actuelle.
2. Temps CI raisonnable (< quelques secondes ajoutées).
3. `bun run ci` ; commit `GARDE-030` ; sprint log à la clôture.

## Deep research

Non.

## Done checklist

- [ ] Story spec
- [ ] Tests
- [ ] Commit `GARDE-030`
- [ ] Sprint log
