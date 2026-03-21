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

### Nounou à domicile partagée entre foyers (analyse comparative)

Si la garde est au foyer mais l’**emploi est réparti** entre plusieurs foyers (ex. 50 % / 50 %) : garde `mode: "nounou_domicile"` et ajoute `householdShareOfEmploymentCost` (ex. `0.5`). Les champs `hourlyGrossEur` et `hoursPerMonth` représentent le **contrat total** (avant partage) ; le moteur applique la quote-part au salaire brut foyer et aux cotisations patronales. Les champs CMG `hourlyDeclaredGrossEur` et `heuresParMois` doivent refléter la **déclaration de ce foyer** à la CAF (souvent proportionnels à la même quote-part). Pour une majoration « plusieurs enfants simultanés » documentée dans le pack, le mode `nounou_partagee` reste adapté (`simultaneousChildrenCount` ≥ 2).

### Coûts complémentaires nounou / garde à domicile (DR-06)

Sur `nounou_domicile` et `nounou_partagee`, objet optionnel **`domicileComplementaryCosts`** (saisie **au niveau du foyer**).

**Transport de la salariée (question harness obligatoire)** : le moteur ne contient **pas** les tarifs Navigo (ils évoluent). L’agent doit **interroger** l’utilisateur puis consulter les **prix officiels** :

- **Île-de-France — Navigo mois** : https://www.iledefrance-mobilites.fr/titres-et-tarifs/detail/forfait-navigo-mois
- **Portail Navigo** : https://www.navigo.fr/

`fraisTransportMensuelEur` = montant **mensuel payé par le foyer employeur** au titre du remboursement (contrat ; peut correspondre au passe plein, au **demi-tarif**, à un forfait **zones limitées**, ou à une **prise en charge partielle** du titre — selon la déclaration utilisateur).  
`fraisTransportBase` = traçabilité : `"non"` | `"navigo_mois_plein"` | `"navigo_demi_tarif"` | `"navigo_zones_limitees"` | `"autre"`. Si ≠ `"non"`, un **montant** > 0 est attendu (sinon warning moteur).

| Champ JSON                                 | Rôle moteur                                                                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `fraisTransportMensuelEur`                 | Remboursement transport — inclus dans brut et dans l’**assiette** crédit d’impôt emploi à domicile.                      |
| `fraisTransportBase`                       | Base tarifaire (harness) ; si renseignée et ≠ `non`, exige `fraisTransportMensuelEur` > 0.                               |
| `provisionCongesPayesMensuelEur`           | Lissage volontaire — **inclus** dans le brut affiché, **exclu** de l’assiette CI (imputation fiscale à la prise réelle). |
| `depensesCotisablesLisseesMensuelEur`      | Ex. ICCP / ICP / CP à la prise, lissés — inclus brut + assiette CI (warnings d’incertitude BOFiP).                       |
| `depensesHorsCreditImpotLisseesMensuelEur` | Ex. indemnité de licenciement lissée — inclus brut, **hors** assiette CI.                                                |

Le snapshot expose **`monthlyBrutTaxCreditAssietteEur`** / **`annualBrutTaxCreditAssietteEur`** (assiette CI) en plus du brut total. Documentation : `docs/research/DR-06-EMPLOI-DOMICILE-COUTS-COMPLEMENTAIRES.md`.

## Champs `brutInput` par `mode`

| `mode`                                                           | Champs principaux (en plus de `mode`)                                                                                                                    |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nounou_domicile`                                                | `hourlyGrossEur`, `hoursPerMonth`, `employerShareOfGross`, optionnels `householdShareOfEmploymentCost`, `domicileComplementaryCosts` (DR-06)             |
| `nounou_partagee`                                                | `hourlyGrossEur`, `hoursPerMonth`, `simultaneousChildrenCount`, `householdShareOfSalary`, `employerShareOfGross`, optionnel `domicileComplementaryCosts` |
| `assistante_maternelle`                                          | `hourlyGrossEur`, `hoursPerMonth`, `careDaysPerMonth`, `indemniteEntretienEurPerDay`, `employerShareOfGross`                                             |
| `mam`                                                            | id. + `structureParticipationEurPerMonth`                                                                                                                |
| `creche_publique` / `creche_privee` / `creche_inter_entreprises` | `monthlyParticipationEur`                                                                                                                                |

## `cmg.cumul` (booléens optionnels)

- `receivesPrepareFull`, `receivesPreparePartial`, `receivesAahOrAeeh` — impact non-cumul / majorations selon le pack de règles.

## Exemples

Dans l’archive skill : dossier **`examples/`** (copie des démos repo). Recopier un fichier et l’adapter.

## Limites moteur (à rappeler à l’utilisateur)

- Pas d’**impôt sur le revenu marginal** : le « disponible » n’est renseigné que si `baselineDisposableIncomeMonthlyEur` est fourni.
- **Crèche publique** : CMG type PSU souvent **non modélisé** (`unsupported` / `ineligible` selon cas).
- **Annualisation** crédit d’impôt : le moteur émet un avertissement (`scenario_annual_tax_credit_uses_brut_x12_…`). Avec DR-06, l’assiette CI peut être **`annualBrutTaxCreditAssietteEur`** (≠ `annualBrutEur`).
- Règles avec `todoVerify` dans le pack : signaler via `uncertainty.referencedRulesPendingVerification`.

## Sources officielles à citer dans les réponses

En dépôt complet : `docs/SOURCES_OFFICIELLES.md`. En résumé : Service-Public, CAF, impots.gouv, URSSAF — jamais se substituer à un conseil personnalisé.
