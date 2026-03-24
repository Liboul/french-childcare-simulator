# Paramètres — nounou à domicile (emploi direct)

## Fiscalité

- **CMG** : mode « emploi direct — garde à domicile » (`cmg-emploi-direct-garde-domicile-2026-04`).
- **Crédit d’impôt** : **emploi à domicile** (CGI art. 199 sexdecies, Service-Public F12), **pas** le crédit « frais de garde hors du domicile » (F8). Non-cumul avec F8 pour les mêmes dépenses (voir `nonCumulWithCreditGardeHorsDomicile` dans le pack).

## Entrées (`NounouDomicileInput`)

| Champ                             | Obligatoire                        | Sens                                                                                                                                 |
| --------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `monthlyEmploymentCostEur`        | Oui pour **partial**               | € / mois — coût employeur (salaire + cotisations). Voir **Cohérence coût / CMG** et **Assiette unique**.                             |
| `monthlyCmgPaidEur`               | Conditionnel                       | € / mois — CMG connue (avis CAF). Si renseigné, le moteur **ne recalcule pas** le CMG à partir du revenu.                            |
| `monthlyHouseholdIncomeForCmgEur` | Conditionnel                       | € / mois — revenu pour le barème CMG (uniquement si pas de CMG saisi — **Priorité saisie / revenu**).                                 |
| `householdChildRank`              | Non (défaut `1`)                   | Rang de l’enfant pour les **taux d’effort** CMG dans le barème pack.                                                                 |
| `childrenCountForCreditCeiling`   | Non (défaut `1`)                   | Nombre d’enfants (ou personnes au sens du plafond 199 sexdecies) pour les **majorations** du plafond annuel — pas forcément tous les enfants du foyer ; si un seul enfant est concerné par ce contrat, **`1`** en général. |
| `custody`                         | Non (défaut `"full"`)              | **Garde alternée** entre parents : l’incrément de plafond par enfant est **divisé par deux** dans le moteur (`shared`). **Pas** un paramètre de co-famille / co-employeurs. |
| `revenuNetImposableEur`           | Non (avec `nombreParts`)           | € / an — avec `nombreParts` : `trace.creditVsIrBrutSatellite` (crédit 199 vs IR brut indicatif).                                     |
| `nombreParts`                     | Non (avec `revenuNetImposableEur`) | — **toujours** avec `revenuNetImposableEur`.                                                                                        |

## Priorité saisie / revenu (CMG)

Si **`monthlyCmgPaidEur` et `monthlyHouseholdIncomeForCmgEur` sont tous deux fournis**, le moteur utilise **uniquement le CMG saisi** ; le revenu est **ignoré** pour le calcul du CMG (`resolveCmgFromEmploymentInput`).

## Cohérence coût / CMG

- **Attendu** : `monthlyEmploymentCostEur` = coût employeur **avant** aide (le modèle soustrait ensuite la CMG pour la trésorerie et la base crédit).
- **Erreur** : coût **déjà net** de la CMG **et** CMG non nulle → double prise en compte. Soit coût **brut** + CMG, soit **reste seul** avec **`monthlyCmgPaidEur: 0`** (et revenu si CMG calculée).

## Assiette unique (approximation)

Le **même** montant mensuel sert au **CMG** (formule ou saisie) et au **crédit 199 sexdecies** (base annuelle = coût employeur annuel − CMG annuelle, puis plafond — voir `computeCreditEmploiDomicileAnnual`). La ventilation salaire / indemnités / autres postes **n’est pas** modélisée ligne à ligne.

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

## Limites

- **Cotisations** : prise en charge CAF (ex. 50 % dans le pack CMG pour le volet cotisations) **non ventilée** en ligne séparée dans ce scénario.
- **Co-gardes / co-employeurs (nounou partagée entre foyers)** : **aucune** répartition multi-foyers — saisir la **part** de coût et de CMG **de ce foyer**, ou lancer une simulation par foyer. Voir aussi **custody** ci-dessus (garde alternée **parents** ≠ co-famille).
