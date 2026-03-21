# Référence harness — `ScenarioInput` (ZIP / hors IDE)

Ce fichier est **embarqué dans le skill** pour les usages **sans** accès au dépôt complet. Le moteur TypeScript vit dans le repo ; sans clone ni API HTTP, le modèle ne peut **pas** calculer seul.

## Deux façons d’obtenir un calcul

1. **Dépôt + Bun** (recommandé) : à la racine du repo, `bun install` puis `bun run demo:scenario docs/demo-scenarios/<fichier>.json` (ou un chemin vers un JSON valide).
2. **HTTP** : `POST /v1/calculate` avec le même JSON ; schéma dans `openapi.yaml` (copié à côté de ce fichier dans l’archive).

## Forme générale du JSON (`ScenarioInput`)

```json
{
  "household": { "taxYear": 2026 },
  "brutInput": { "mode": "…", "…": "…" },
  "cmg": { "cumul": {}, "…": "…" },
  "taxCredit": {},
  "baselineDisposableIncomeMonthlyEur": null,
  "declaredEmployerChildcareSupportAnnualEur": null,
  "referenceEmployerChildcareSupportAnnualEur": null
}
```

- `household` : pour l’instant surtout `taxYear` (ex. `2026`).
- `brutInput` : union discriminée par `mode` (champs **obligatoires** différents selon le mode).
- `cmg` : sans `mode` (le moteur reprend `brutInput.mode`). Champs typiques selon le type de garde : revenus de référence, rang d’effort, heures, barème structure, etc. Voir les exemples JSON.
- `taxCredit`, `baselineDisposableIncomeMonthlyEur`, etc. : optionnels ; défauts moteur si omis.

## Champs `brutInput` par `mode`

| `mode`                                                           | Champs principaux (en plus de `mode`)                                                                            |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `nounou_domicile`                                                | `hourlyGrossEur`, `hoursPerMonth`, `employerShareOfGross`                                                        |
| `nounou_partagee`                                                | `hourlyGrossEur`, `hoursPerMonth`, `simultaneousChildrenCount`, `householdShareOfSalary`, `employerShareOfGross` |
| `assistante_maternelle`                                          | `hourlyGrossEur`, `hoursPerMonth`, `careDaysPerMonth`, `indemniteEntretienEurPerDay`, `employerShareOfGross`     |
| `mam`                                                            | id. + `structureParticipationEurPerMonth`                                                                        |
| `creche_publique` / `creche_privee` / `creche_inter_entreprises` | `monthlyParticipationEur`                                                                                        |

## `cmg.cumul` (booléens optionnels)

- `receivesPrepareFull`, `receivesPreparePartial`, `receivesAahOrAeeh` — impact non-cumul / majorations selon le pack de règles.

## Exemples

Dans l’archive skill : dossier **`examples/`** (copie des démos repo). Recopier un fichier et l’adapter.

## Limites moteur (à rappeler à l’utilisateur)

- Pas d’**impôt sur le revenu marginal** : le « disponible » n’est renseigné que si `baselineDisposableIncomeMonthlyEur` est fourni.
- **Crèche publique** : CMG type PSU souvent **non modélisé** (`unsupported` / `ineligible` selon cas).
- **Annualisation** crédit d’impôt : le moteur émet un avertissement (`scenario_annual_tax_credit_uses_brut_x12_…`).
- Règles avec `todoVerify` dans le pack : signaler via `uncertainty.referencedRulesPendingVerification`.

## Sources officielles à citer dans les réponses

En dépôt complet : `docs/SOURCES_OFFICIELLES.md`. En résumé : Service-Public, CAF, impots.gouv, URSSAF — jamais se substituer à un conseil personnalisé.
