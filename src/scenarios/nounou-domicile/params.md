# Paramètres — nounou à domicile (emploi direct)

## Fiscalité

- **CMG** : mode « emploi direct — garde à domicile » (`cmg-emploi-direct-garde-domicile-2026-04`).
- **Crédit d’impôt** : **emploi à domicile** (CGI art. 199 sexdecies, Service-Public F12), **pas** le crédit « frais de garde hors du domicile » (F8). Non-cumul avec F8 pour les mêmes dépenses (voir `nonCumulWithCreditGardeHorsDomicile` dans le pack).

## Entrées (`NounouDomicileInput`)

### Coût employeur — deux modes (exclusifs)

| Champ                      | Obligatoire                 | Sens                                                                                                                                 |
| -------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `monthlyEmploymentCostEur` | Conditionnel (voir ci-dessous) | € / mois — coût employeur **total** (salaire + cotisations + ICP modélisés si inclus). **Non recalculé** si fourni seul. Ignoré si `hourlyGrossRateEur` est fourni. |
| `hourlyGrossRateEur`       | Conditionnel                | € / h **brut**. Si fourni, le moteur calcule `monthlyEmploymentCostEur` (Pajemploi / Urssaf 2026 — voir section **Taux**). |
| `weeklyHoursFullTime`      | Non (défaut **40**)         | Heures hebdomadaires du **contrat total** (avant part foyer).                                                                 |
| `householdShareFraction`   | Non (défaut **1**)         | Part **0–1** du foyer sur ce contrat (ex. 4/9 ≈ 0,444). Si `nounouEmploymentModel` = `co_famille` et champ absent, **dérivation** possible depuis `coFamilleHouseholdCostSharePercent` ÷ 100. |
| `includeIcp`               | Non (défaut **true**)       | Inclure les **indemnités de congés payés** à **10 %** du brut dans le coût employeur. Si `false`, pas d’ICP dans l’enveloppe (congés réels hors modèle). |
| `monthlyMealAllowanceEur`    | Non (défaut **0**)          | Indemnité / avantage **repas** mensuel (€), **part du foyer** — ajouté au coût employeur. |

### Autres

| Champ                             | Obligatoire                        | Sens                                                                                                                                 |
| --------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `monthlyCmgPaidEur`               | Conditionnel                       | € / mois — CMG connue (avis CAF). Si renseigné, le moteur **ne recalcule pas** le CMG à partir du revenu.                            |
| `monthlyHouseholdIncomeForCmgEur` | Conditionnel                       | € / mois — revenu pour le barème CMG (uniquement si pas de CMG saisi — **Priorité saisie / revenu**).                                 |
| `householdChildRank`              | Non (défaut `1`)                   | Rang de l’enfant pour les **taux d’effort** CMG dans le barème pack.                                                                 |
| `childrenCountForCreditCeiling`   | Non (défaut `1`)                   | Nombre d’enfants (ou personnes au sens du plafond 199 sexdecies) pour les **majorations** du plafond annuel — pas forcément tous les enfants du foyer ; si un seul enfant est concerné par ce contrat, **`1`** en général. |
| `custody`                         | Non (défaut `"full"`)              | **Garde alternée** entre parents : l’incrément de plafond par enfant est **divisé par deux** dans le moteur (`shared`). **Pas** un paramètre de co-famille / co-employeurs. |
| `revenuNetImposableEur`           | Non (avec `nombreParts`)           | € / an — avec `nombreParts` : `trace.creditVsIrBrutSatellite` (crédit 199 vs IR brut indicatif).                                     |
| `nombreParts`                     | Non (avec `revenuNetImposableEur`) | — **toujours** avec `revenuNetImposableEur`.                                                                                        |
| `prefinancedCesuEmployerUses`     | Non (défaut `false`)               | L’employeur verse-t-il des **CESU préfinancés** ? Si `true`, **`prefinancedCesuMode` obligatoire**.                                 |
| `prefinancedCesuMonthlyEur`       | Non                                | € / mois — montant de CESU employeur (indicatif pour la trace).                                                                     |
| `prefinancedCesuMode`             | Si CESU oui                        | `on_top` \| `substitutes_constant_employer_cost` — en plus du coût saisi, ou arbitrage pour **même** coût employeur total. En **`substitutes_constant_employer_cost`**, la **baisse de brut** qui compense le CESU **n’est pas** le montant CESU : \( \Delta\text{brut} = \text{CESU} / (1 + \tau_\text{patronal}) \) — voir **trace** `cesuSubstitutionDeltaBrutEur` (indicatif ; taux salarial approx. **22 %** pour `cesuSubstitutionNetSalaryImpactEur`). |
| `childcareProviderAcceptsCesu`    | Non                                | La nounou / l’emploi accepte-t-il le paiement par CESU ? **Agent** : poser la question. |
| `prefinancedCesuAvailableForChildcareFraction` | Non (défaut 1)      | Entre **0** et **1** — part du CESU employeur **utilisable pour cette garde** si une partie sert à d’autres services. |
| `nounouEmploymentModel`           | Non                                | `full_single_employer` \| `co_famille` — un employeur pour ce contrat vs co-famille. **Agent** : **toujours** demander. |
| `monthlyAncillaryCostsEur`        | Non (défaut `0`)                   | € / mois — repas, transport, etc. ; ajoutés au reste à charge après crédit (`estimatedMonthlyHouseholdCashOutEur`). Hors plafond crédit 199 si non éligibles. |
| `monthlyNavigoShareEur`       | Non (défaut **0**)          | € / mois — **part employeur** du pass Navigo (ex. **50 %** × abonnement × fraction foyer). **Non éligible** au crédit **199 sexdecies** (hors base) — ajouté uniquement à l’**effort cash** (comme frais annexes). Réf. tarifaire Île-de-France **2026** : **90,80 €** / mois → **45,40 €** à répartir entre co-employeurs selon la part du foyer. |
| `coFamilleHouseholdCostSharePercent` | Non (défaut absent)             | 0–100 — **part du coût / de la charge attribuée à ce foyer** en co-famille (information ; peut aussi **dériver** `householdShareFraction` si ce dernier est absent). |

**Pour obtenir un calcul `partial`** : fournir au moins **`monthlyEmploymentCostEur`** **ou** **`hourlyGrossRateEur`**, puis **`monthlyCmgPaidEur`** **ou** **`monthlyHouseholdIncomeForCmgEur`**.

## Taux de référence Pajemploi 2026 (Urssaf particuliers)

Source officielle : [Urssaf — taux de cotisations des particuliers employeurs](https://www.urssaf.fr/accueil/outils-documentation/taux-baremes/taux-cotisations-particuliers.html) (garde d’enfants à domicile).

| Libellé | Taux |
| ------- | ---- |
| Cotisations **sans** prise en charge santé au travail | **44,696 %** |
| Cotisations **avec** prise en charge santé au travail | **47,396 %** |
| Plafond de la contribution **santé au travail** | **5 €** / mois |

**Formule utilisée** (cotisations patronales mensuelles) :

\[
\min(\text{brut} \times 44{,}696\,\% + 5\ €,\ \text{brut} \times 47{,}396\,\%)
\]

Interprétation : la **prise en charge santé au travail** est **plafonnée** ; le **minimum** des deux expressions correspond au **taux effectif** appliqué sur le brut (`trace.effectivePatronalRateApplied`).

**Heures mensuelles foyer** :  
`weeklyHoursFullTime` × `householdShareFraction` × **52 / 12**  
 puis **brut mensuel** = `hourlyGrossRateEur` × ces heures.

**ICP** : si `includeIcp` = true, **10 %** du brut mensuel **ajoutés** au coût employeur (sinon 0 — congés réels hors modèle).

## Pass Navigo (Île-de-France)

- Le **remboursement** employeur (souvent **50 %** de l’abonnement) est **obligatoire** en IDF mais **n’entre pas** dans la **base du crédit d’impôt 199 sexdecies**.
- Saisir le montant **déjà** ventilé pour **ce foyer** dans `monthlyNavigoShareEur` (ex. 50 % × 90,80 € × fraction foyer, ou montant connu).
- Le moteur l’ajoute à **`estimatedMonthlyHouseholdCashOutEur`** uniquement, **sans** l’inclure dans la base crédit.

## Priorité saisie / revenu (CMG)

Si **`monthlyCmgPaidEur` et `monthlyHouseholdIncomeForCmgEur` sont tous deux fournis**, le moteur utilise **uniquement le CMG saisi** ; le revenu est **ignoré** pour le calcul du CMG (`resolveCmgFromEmploymentInput`).

## Cohérence coût / CMG

- **Attendu** : `monthlyEmploymentCostEur` (saisi ou calculé) = coût employeur **avant** aide (le modèle soustrait ensuite la CMG pour la trésorerie et la base crédit).
- **Erreur** : coût **déjà net** de la CMG **et** CMG non nulle → double prise en compte. Soit coût **brut** + CMG, soit **reste seul** avec **`monthlyCmgPaidEur: 0`** (et revenu si CMG calculée).

## Assiette unique (approximation)

Le **même** montant mensuel sert au **CMG** (formule ou saisie) et au **crédit 199 sexdecies** (base annuelle = coût employeur annuel − CMG annuelle, puis plafond — voir `computeCreditEmploiDomicileAnnual`). La ventilation salaire / indemnités / autres postes **n’est pas** modélisée ligne à ligne. **Navigo** et autres frais **non éligibles** ne sont **pas** dans cette assiette.

## Règle pack `credit-impot-emploi-domicile-plafonds`

Paramètres typiques lus par le moteur (valeurs réelles dans le pack) :

| Paramètre (typique) | Rôle |
| -------------------- | ---- |
| `rate` | Taux appliqué à la base éligible plafonnée (souvent **0,5**). |
| `standardAnnualExpenseCeilingEur` | Plafond annuel de base des dépenses ouvrant droit au crédit. |
| `incrementPerChildOrSeniorEur` | Majoration par enfant (ou personne au sens du texte), avant plafond global. |
| `standardAnnualExpenseCeilingMaxAfterIncrementsEur` | Plafond annuel **après** majorations (cap). |

La **base éligible** annuelle est `min(max(0, coût annuel − CMG annuelle), plafond retenu)` — la CMG est **toujours** retranchée du coût pour ce crédit dans le code (pas d’équivalent `deductCmgFromBase` optionnel comme pour le F8).

## Trace (`partial`) — équivalents mensuels

- `monthlyCreditEquivalentEur` = crédit d’impôt annuel ÷ **12** : mensualisation **pédagogique**, pas calendrier réel des avances / restitutions. Voir `src/shared/monthly-cashflow-after-aides.ts`.
- Si coût **calculé depuis l’horaire** : `computedMonthlyGrossSalaryEur`, `computedMonthlyPatronalChargesEur`, `computedMonthlyIcpEur`, `effectivePatronalRateApplied`, `monthlyHoursForHousehold`.
- `monthlyNavigoShareEur` — distinct de `monthlyAncillaryCostsEur` ; les deux s’ajoutent à l’effort cash après crédit.
- Mode **substitutes** CESU : `cesuSubstitutionDeltaBrutEur`, `cesuSubstitutionNetSalaryImpactEur`, `cesuNetGainVsSalaryEur` (indicatif).

## Exemple de vérification (terrain)

Entrée JSON (ordre de grandeur attendu **±1 €** sur les montants dérivés du brut) :

```json
{
  "hourlyGrossRateEur": 15,
  "weeklyHoursFullTime": 40,
  "householdShareFraction": 0.4444,
  "includeIcp": true,
  "nounouEmploymentModel": "co_famille",
  "coFamilleHouseholdCostSharePercent": 44.44,
  "monthlyNavigoShareEur": 20,
  "monthlyHouseholdIncomeForCmgEur": 10000,
  "childrenCountForCreditCeiling": 1,
  "revenuNetImposableEur": 120000,
  "nombreParts": 2.5
}
```

Résultats attendus (à ±1 €) : `computedMonthlyGrossSalaryEur` ≈ **1 156 €**, `computedMonthlyPatronalChargesEur` ≈ **521 €**, `computedMonthlyIcpEur` ≈ **116 €**, `monthlyEmploymentCostEur` ≈ **1 793 €**, `annualCreditEmploiDomicileEur` = **6 750 €**, `netMonthlyBurdenAfterCreditEur` ≈ **1 230 €**, `estimatedMonthlyHouseholdCashOutEur` ≈ **1 251 €** (avec Navigo 20 €). Couvert par les tests automatisés (`bun test ./src`).

## Agent (intake)

- Pour le coût, proposer soit **saisie directe** du coût employeur, soit **brut horaire + heures + part foyer** (simulateur Urssaf / emploi à domicile, ou hypothèse explicite) si l’utilisateur ne connaît pas le total — voir `INTAKE.md` du skill.
- **Toujours** demander les **CESU préfinancés employeur** : présence, montant mensuel si utile, mode **en plus** vs **arbitrage même coût total**, **acceptation des CESU par la nounou**, **fraction disponible pour la garde** si autres usages — voir `INTAKE.md` du skill (**CESU**).
- **Toujours** demander **`nounouEmploymentModel`** : employeur unique (`full_single_employer`) vs **co-famille** (`co_famille`).
- **Navigo** en Île-de-France : documenter la part **employeur** et le **non-éligibilité** au crédit 199.
- **Coût réel global foyer** : arbitrage **brut** / CESU peut **abaisser l’IR** (RNI plus bas) — **non** inclus dans `netMonthlyBurdenAfterCreditEur` ; rappel oral ou **`revenuNetImposableEur`** révisé pour le satellite — voir `params.md` crèche publique (**Coût réel global**) et `INTAKE.md` du skill.

## CESU préfinancé et moteur

- **CMG / crédit 199** : calculés sur `monthlyEmploymentCostEur` (assiette unique). Le **total charge employeur** (`trace.totalEmployerOutlayMonthlyEur`) ajoute le CESU uniquement si `prefinancedCesuMode` = `on_top`.
- Non-cumuls CMG × CESU : notes automatiques si CESU préfinancé **et** CMG > 0 (règle pack `cesu-cmg-non-cumul`) — pas d’annulation du CMG dans le moteur ; vérification dossier. Plafonds employeur : `cesu-prefinance-plafond-aide-financiere-employeur`. **Déclaration fiscale** : base du crédit 199 = dépenses réelles déclarées (ex. case **7DR**) — ne pas confondre avec CESU **déclaratif** sur d’autres lignes.

## Limites

- **Cotisations** : prise en charge CAF (ex. 50 % dans le pack CMG pour le volet cotisations) **non ventilée** en ligne séparée dans ce scénario.
- **Co-gardes / co-employeurs (nounou partagée entre foyers)** : **aucune** répartition multi-foyers automatique des montants — saisir la **part** de coût et de CMG **de ce foyer**, ou lancer une simulation par foyer. Voir aussi **custody** ci-dessus (garde alternée **parents** ≠ co-famille).
- **Substitution CESU** : les champs `cesuSubstitution*` sont **indicatifs** (hypothèse **22 %** salarial) ; pas de refonte de paie.
