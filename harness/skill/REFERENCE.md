# Référence harness — `ScenarioInput` (ZIP / hors IDE)

Ce fichier est **embarqué dans le skill** pour les usages **sans** accès au dépôt complet. Le calcul passe par **`scripts/simulate.mjs`** (bundle Node, règles incluses).

## Obtenir un calcul

1. **Skill ZIP** (archive harness / Agent Skills) : `node scripts/simulate.mjs <fichier.json>` ou `node scripts/simulate.mjs - < fichier.json` — sortie JSON moteur sur stdout ; erreurs de validation sur stderr au format `{ "error": "validation_failed", "issues": [...] }`.
2. **Dépôt + Bun** : à la racine du repo, `bun install` puis `bun run demo:scenario docs/demo-scenarios/<fichier>.json` (ou un chemin vers un JSON valide) — même logique que `simulate.mjs`.

**OpenAPI / GPT / autres canaux** : le fichier `harness/openapi.yaml` dans le **dépôt** décrit encore `POST /v1/calculate` pour les intégrations HTTP ; il **n’est plus** copié dans l’archive skill harness (**GARDE-035**).

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

### Soutien employeur (`declaredEmployerChildcareSupportAnnualEur` / `referenceEmployerChildcareSupportAnnualEur`)

Lorsque **les deux** montants annuels sont renseignés, le snapshot expose `employerSupportDeltaAnnualEur` (déclaré − référence) et **`employerSupportIsComparisonScenario`: `true`**. Cet écart sert à **comparer deux hypothèses** d’enveloppe employeur pour le même scénario de garde ; il **ne réduit pas** `netHouseholdBurdenMonthlyEur` / `netHouseholdBurdenAnnualEur` (calculés comme brut − CMG − crédit d’impôt). Une étape **`trace`** `employer_benefits` (`scenario_employer_support_comparison`) le rappelle explicitement.

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

**Part salarié en crèche PSU** (participation familiale — **pas** une simulation d’**aide** type CMG) :

- **Priorité** : https://www.monenfant.fr/simuler-le-cout-en-creche — **Simuler le coût en crèche** (reste à charge mensuel, barème national Cnaf / PSU ; indicatif).

**Simulateurs d’aides** (CMG, autres prestations — **ne remplacent pas** monenfant pour la **part familiale PSU**) :

- https://www.caf.fr/allocataires/mes-services-en-ligne/estimer-vos-droits — hub **Estimer vos droits**.
- https://www.caf.fr/allocataires/aides-et-demarches/thematique-libre/votre-simulation-de-mode-de-garde — simulation **mode de garde** (CMG / PAJE).
- https://www.mesdroitssociaux.gouv.fr/votre-simulateur/accueil — **mesdroitssociaux.gouv.fr**.
- **MSA** : https://www.msa.fr/ — simulateurs **aides** ; barème PSU = principe national, confirmer au besoin auprès de la caisse.

Si l’utilisateur refuse d’ouvrir **monenfant**, l’agent peut proposer une **fourchette ou un €/mois indicatif** à partir des **publications barème PSU / participation familiale** (caf.fr, Cnaf) — **citer les URLs**, **validation explicite** — voir **`SKILL.md`** (section participation crèche).

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

## Plafond légal — aide employeur CESU préfinancé

Ce plafond concerne l’**aide financière employeur / CSE** versée en **CESU préfinancé** (L.7233-4) — **pas** les plafonds du **crédit d’impôt** emploi à domicile.

- **Source dans ce projet** : règle du pack **`cesu-prefinance-plafond-aide-financiere-employeur`** (`config/rules.fr-2026.json`), paramètre **`maxAnnualAidPerBeneficiaryEur`**.
- **Pack `rules.fr-2026`** (aligné simulateur embarqué) : **2540 € / an / bénéficiaire** à compter de **`effectiveFrom` : `2025-01-01`** (contre **2421 €** jusqu’en 2024, paramètre `previousMaxAnnualAidPerBeneficiaryEurUntil2024` dans le même JSON). Liens officiels listés dans **`sources[]`** de cette règle (servicesalapersonne.gouv.fr, JORF).
- **Usage agent** : **ne pas** aller chercher ce montant sur le web pour « deviner » le plafond — **citer la valeur du pack** chargé avec le moteur et, après run, **`meta.rulePackVersion`**. Si `taxCredit.prefundedCesuAnnualEur` dépasse le plafond du pack, le moteur ajoute le code **`cesu_prefunded_exceeds_employer_aid_annual_cap`** dans **`warnings`** (la saisie n’est pas tronquée).

## Limites moteur (à rappeler à l’utilisateur)

- **IR / disponible** : optionnel via **`incomeTax`** (revenu net imposable ou brut + parts + `filing`, ou seulement `annualHouseholdIncomeAfterIncomeTaxEur`, ou seulement `annualNetSalaryFromPayslipsEur` pour un objet `incomeTax` minimal). Le snapshot expose TMI / IR estimés ; plafonnement QF non modélisé (`limitationHints`). Vérifier le **PAS** vs solde annuel (voir `warnings`). Si vous avez une estimation IR mais **`disposableIncomeMonthlyEur`** reste `null`, consulter **`incomeTaxDisposableHintsFr`** (messages sur les champs manquants et la différence net bulletin vs après IR).
- **Avertissements** : les entrées `uncertainty.flags[]` peuvent inclure **`messageFr`** pour les codes répertoriés (ex. nounou partagée / CESU / employeur).
- **CESU préfinancé (emploi à domicile)** : avec `taxCredit.prefundedCesuAnnualEur` > 0 pour `nounou_domicile` / `nounou_partagee`, une étape **`trace`** `scenario_tax_credit_prefunded_cesu` décrit l’effet sur l’assiette. **Plafond aide employeur** : voir section **Plafond légal — aide employeur CESU préfinancé** ci-dessus (pack `rules.fr-2026` → **2540 €** / an / bénéficiaire ; dépassement → `warnings`). **Avant** saisie : **`INTAKE.md`** § 3 bis **partie A** (question **obligatoire**, puis complément vs substitution vs brut URSSAF).
- **Aide employeur déductible (garde hors domicile)** : `taxCredit.outsideHomeAnnualEmployerAidDeductibleEur` réduit l’assiette du crédit « garde hors du domicile » (`assistante_maternelle`, `mam`, `creche_*`). Y inclure notamment les **CESU / titres employeur** affectés à **cette** garde quand l’utilisateur les déclare ainsi — **pas** via `prefundedCesuAnnualEur`. **Avant** saisie : **`INTAKE.md`** § 3 bis **partie B** (question **obligatoire**, puis complément vs substitution vs dépenses saisies).
- **Revenus foyer dans le snapshot** : échos pour la fiche de transparence — `householdGrossSalaryAnnualEur` / `householdGrossSalaryMonthlyEur` (saisie `annualGrossSalaryEur`), `householdNetSalaryAnnualEur` / `Monthly` (`annualNetSalaryFromPayslipsEur`, net bulletin ≠ après IR), `householdIncomeAfterIncomeTaxAnnualEur` / `Monthly` (`annualHouseholdIncomeAfterIncomeTaxEur`). `null` si le champ source est absent.
- **Crèche publique / inter-entreprises** : CMG PSU souvent **non modélisé** (`cmgStatus` = `unsupported`, montant 0 € **dans ce moteur**). Ce n’est **pas** une preuve d’absence d’aide en réel : lire **`limitationHints`**, **`warnings` / `uncertainty.flags` (`messageFr`)** et la **CAF**. L’étape **`trace`** `scenario_cmg` le rappelle aussi.
- **Annualisation** crédit d’impôt : le moteur émet un avertissement (`scenario_annual_tax_credit_uses_brut_x12_…`). Avec DR-06, l’assiette CI peut être **`annualBrutTaxCreditAssietteEur`** (≠ `annualBrutEur`).
- Règles avec `todoVerify` dans le pack : signaler via `uncertainty.referencedRulesPendingVerification`.

## Sources officielles à citer dans les réponses

En dépôt complet : `docs/SOURCES_OFFICIELLES.md`. En résumé : Service-Public, CAF, impots.gouv, URSSAF — jamais se substituer à un conseil personnalisé.

## Recherche embarquée dans le skill (`research/`)

Le ZIP / dossier skill contient **`research/README.md`** et les **`DR-*.md`** (copie des rapports `docs/research/` du dépôt, hors `prompts/`). Tu peux t’y **référer si besoin** pour expliquer le cadre ou les limites ; pour les **€ et le routage moteur**, rester sur la sortie **`simulate.mjs`** (voir README du dossier `research/`).
