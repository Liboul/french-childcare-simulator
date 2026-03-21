# Référence harness — `ScenarioInput` (ZIP / hors IDE)

Ce fichier est **embarqué dans le skill** pour les usages **sans** accès au dépôt complet. Le calcul passe par **`scripts/simulate.mjs`** (bundle Node, règles incluses).

## Obtenir un calcul

1. **Skill ZIP (claude.ai)** : `node scripts/simulate.mjs <fichier.json>` ou `node scripts/simulate.mjs - < fichier.json` — sortie JSON moteur sur stdout ; erreurs de validation sur stderr au format `{ "error": "validation_failed", "issues": [...] }`.
2. **Dépôt + Bun** : à la racine du repo, `bun install` puis `bun run demo:scenario docs/demo-scenarios/<fichier>.json` (ou un chemin vers un JSON valide) — même logique que `simulate.mjs`.

**OpenAPI / GPT / autres canaux** : le fichier `harness/openapi.yaml` dans le **dépôt** décrit encore `POST /v1/calculate` pour les intégrations HTTP ; il **n’est plus** copié dans l’archive skill Claude (**GARDE-035**).

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

(Option : objet **`incomeTax`** pour IR / TMI — voir schéma JSON / `INTAKE.md`.)

- `household` : pour l’instant surtout `taxYear` (ex. `2026`).
- `brutInput` : union discriminée par `mode` (champs **obligatoires** différents selon le mode).
- `cmg` : sans `mode` (le moteur reprend `brutInput.mode`). Champs typiques selon le type de garde : revenus de référence, rang d’effort, heures, barème structure, etc. Voir les exemples JSON.
- `taxCredit`, `baselineDisposableIncomeMonthlyEur`, **`incomeTax`** (IR / TMI, GARDE-019), etc. : optionnels ; défauts moteur si omis.

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

### Crèches — participation familiale (**question obligatoire**)

Pour **`creche_publique`**, **`creche_privee`**, **`creche_inter_entreprises`** : l’agent doit **toujours** demander à l’utilisateur le montant **mensuel réellement payé par le parent** et le saisir dans **`monthlyParticipationEur`**. Sans réponse utilisateur, **ne pas** inventer le montant ni utiliser 0 par défaut. Le moteur n’intègre **pas** de simulateur de barème PSU : la saisie est la seule source du brut crèche.

**Outils officiels** (à donner si le montant manque — crèche **PSU** / participation familiale) :

- https://www.caf.fr/allocataires/mes-services-en-ligne/estimer-vos-droits — hub **Estimer vos droits** (CAF).  
- https://www.caf.fr/allocataires/aides-et-demarches/thematique-libre/votre-simulation-de-mode-de-garde — simulation **mode de garde**.  
- https://www.mesdroitssociaux.gouv.fr/votre-simulateur/accueil — portail **mesdroitssociaux.gouv.fr**.  
- Foyers relevant de la **MSA** : site **msa.fr**, rubrique estimation / simulateur.

Si l’utilisateur refuse d’ouvrir ces outils, l’agent peut proposer une **fourchette ou un €/mois indicatif** en s’appuyant sur des **barèmes et pages officielles** consultées en ligne (**citer les URLs**), avec **validation explicite** de l’utilisateur avant simulation — voir **`SKILL.md`** (section participation crèche).

## Champs `brutInput` par `mode`

| `mode`                                                           | Champs principaux (en plus de `mode`)                                                                                                                    |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nounou_domicile`                                                | `hourlyGrossEur`, `hoursPerMonth`, `employerShareOfGross`, optionnels `householdShareOfEmploymentCost`, `domicileComplementaryCosts` (DR-06)             |
| `nounou_partagee`                                                | `hourlyGrossEur`, `hoursPerMonth`, `simultaneousChildrenCount`, `householdShareOfSalary`, `employerShareOfGross`, optionnel `domicileComplementaryCosts` |
| `assistante_maternelle`                                          | `hourlyGrossEur`, `hoursPerMonth`, `careDaysPerMonth`, `indemniteEntretienEurPerDay`, `employerShareOfGross`                                             |
| `mam`                                                            | id. + `structureParticipationEurPerMonth`                                                                                                                |
| `creche_publique` / `creche_privee` / `creche_inter_entreprises` | `monthlyParticipationEur` (part familiale facturée ; PSU vs micro-crèche : **DR-08**, **DR-04**)                                                         |

## `cmg.cumul` (booléens optionnels)

- `receivesPrepareFull`, `receivesPreparePartial`, `receivesAahOrAeeh` — impact non-cumul / majorations selon le pack de règles.

## Exemples

Dans l’archive skill : dossier **`examples/`** (copie des démos repo). Recopier un fichier et l’adapter.

## Limites moteur (à rappeler à l’utilisateur)

- **IR / disponible** : optionnel via **`incomeTax`** (revenu net imposable ou brut + parts + `filing`, ou seulement `annualHouseholdIncomeAfterIncomeTaxEur`, ou seulement `annualNetSalaryFromPayslipsEur` pour un objet `incomeTax` minimal). Le snapshot expose TMI / IR estimés ; plafonnement QF non modélisé (`limitationHints`). Vérifier le **PAS** vs solde annuel (voir `warnings`).
- **Revenus foyer dans le snapshot** : échos pour la fiche de transparence — `householdGrossSalaryAnnualEur` / `householdGrossSalaryMonthlyEur` (saisie `annualGrossSalaryEur`), `householdNetSalaryAnnualEur` / `Monthly` (`annualNetSalaryFromPayslipsEur`, net bulletin ≠ après IR), `householdIncomeAfterIncomeTaxAnnualEur` / `Monthly` (`annualHouseholdIncomeAfterIncomeTaxEur`). `null` si le champ source est absent.
- **Crèche publique** : CMG type PSU souvent **non modélisé** (`unsupported` / `ineligible` selon cas).
- **Annualisation** crédit d’impôt : le moteur émet un avertissement (`scenario_annual_tax_credit_uses_brut_x12_…`). Avec DR-06, l’assiette CI peut être **`annualBrutTaxCreditAssietteEur`** (≠ `annualBrutEur`).
- Règles avec `todoVerify` dans le pack : signaler via `uncertainty.referencedRulesPendingVerification`.

## Sources officielles à citer dans les réponses

En dépôt complet : `docs/SOURCES_OFFICIELLES.md`. En résumé : Service-Public, CAF, impots.gouv, URSSAF — jamais se substituer à un conseil personnalisé.
