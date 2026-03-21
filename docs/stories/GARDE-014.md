# GARDE-014 — Matrice d’intégration (RAC, plafonds, cumuls, inéligibilité)

| Field     | Value                                                                  |
| --------- | ---------------------------------------------------------------------- |
| **Epic**  | E0 / E2                                                                |
| **Links** | [`INITIAL_SPEC.md`](../INITIAL_SPEC.md) § Tests, **GARDE-006**–**012** |

## User / product value

Une **matrice de tests d’intégration** documentée et exécutable garantit les garde-fous produit : **reste à charge jamais négatif**, comportements **CMG / cumul / inéligibilité**, **CESU préfinancé** sur le crédit emploi à domicile, **non-cumul CESU × CMG**, et **chaîne export** stable.

## Scope

**In scope**

- Fichier `src/integration/matrix.test.ts` : scénarios tabulés (id + `ScenarioInput` + assertions).
- Invariants : `netHouseholdBurdenAnnualEur >= 0`, `netHouseholdBurdenMonthlyEur >= 0` sur chaque ligne.
- Cas : micro-crèche **inéligible**, crèche publique **CMG unsupported**, **PreParE plein** (CMG nul), **assistante maternelle** (crédit hors domicile), **préfinancé** qui **réduit** le crédit vs sans préfinancé, gate **CESU déclaratif × CMG**, **JSON export** parseable.

**Out of scope**

- Property-based tests exhaustifs, perf, E2E navigateur.

## Acceptance criteria

1. `bun run test` inclut la matrice ; tous les tests verts.
2. Au moins **8** cas métier distincts dans la matrice.
3. Commit `GARDE-014` ; sprint log.

## Deep research

Non.

## Done checklist

- [x] Story spec
- [x] Code + tests
- [x] Commit `GARDE-014`
- [x] Sprint log
