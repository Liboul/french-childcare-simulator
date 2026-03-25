# Paramètres — crèche publique

## Ordre de modélisation (projet)

1. **Crèche publique** (ce scénario) — structure, CMG « structure », crédit d’impôt hors domicile.
2. **Assistante maternelle** — CMG emploi direct, cotisations, indemnités.
3. **Nounou à domicile** — PAJE / CESU, CMG domicile, crédit emploi à domicile, non-cumuls.
4. **Crèche / berceau employeur** — avantage en nature, exonération, coût employeur.

## Entrées (`CrechePubliqueInput`)

| Champ                     | Obligatoire                        | Unité                  | Sens                                                                                                                                                                                                                       |
| ------------------------- | ---------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `monthlyParticipationEur` | Oui pour un calcul **partial**     | € / mois               | Part payée ou due au titre de la garde en **structure** (facture / avis). Doit être **cohérent** avec la façon dont vous saisissez la CMG (voir **Cohérence participation / CMG**).                                     |
| `monthlyCmgStructureEur`  | Non (défaut `0`)                   | € / mois               | Montant mensuel de **complément mode de garde** pour ce mode « structure » (avis CAF / MSA). **Éligibilité / montant** : vérifier sur le dossier (ressources, mode de garde, structure) — le moteur **ne** valide **pas** l’ouverture des droits ; aide indicative : [Estimer vos droits](https://wwwd.caf.fr/redirect/estimer-vos-droits) (CAF) / équivalent MSA. Si la facture est **déjà nette** de la CMG, laisser **0** et mettre dans `monthlyParticipationEur` uniquement le net à payer. |
| `childrenCount`           | Non (défaut `1`)                   | entier ≥ 1             | Nombre d’enfants pour lesquels **ces dépenses de garde en structure** ouvrent le plafond du crédit (multiplicateur des plafonds « par enfant »). Ce n’est **pas** obligatoirement le nombre total d’enfants du foyer : si un seul enfant est en crèche, saisir `1` même avec d’autres enfants à charge. |
| `custody`                 | Non (défaut `"full"`)              | `"full"` \| `"shared"` | Garde alternée : plafonds **réduits** pour le crédit d’impôt (paramètres du pack).                                                                                                                                         |
| `revenuNetImposableEur`   | Non (avec `nombreParts`)           | € / an                 | Revenu net imposable du foyer (hypothèse) — **uniquement** avec `nombreParts` : active `trace.creditVsIrBrutSatellite` (crédit vs IR brut indicatif).                                                                      |
| `nombreParts`             | Non (avec `revenuNetImposableEur`) | parts                  | Nombre de parts du quotient familial — **uniquement** avec `revenuNetImposableEur`.                                                                                                                                        |
| `childcareProviderAcceptsCesu` | Non                           | booléen                | La crèche **accepte-t-elle** le paiement par chèques CESU ? Information trésorerie — **ne modifie pas** le calcul F8. **Agent** : toujours poser la question. |
| `monthlyAncillaryCostsEur`    | Non (défaut `0`)              | € / mois               | Repas, transport, adhésion… **hors** base F8 si non éligibles — ajoutés au **reste à charge après crédit** pour un effort total estimé (`estimatedMonthlyHouseholdCashOutEur`). |

## Cohérence participation / CMG

- **Cas attendu A — facture « brute » + CMG ventilée** : `monthlyParticipationEur` = part famille **avant** abattement CMG sur la facture (ou équivalent), et `monthlyCmgStructureEur` = CMG mensuelle pour ce mode. La trésorerie est modélisée comme participation − CMG ; la **base du crédit d’impôt** peut, selon le pack, retrancher la CMG (voir `deductCmgFromBase` ci-dessous).
- **Cas attendu B — facture déjà nette** : le foyer ne paie que le net ; mettre ce net dans `monthlyParticipationEur` et **`monthlyCmgStructureEur: 0`**. Ne pas resaisir la CMG : sinon la CMG est **soustraite deux fois** (trésorerie et, si le pack le prévoit, base crédit).
- **Si les deux champs sont non nuls** : vérifier explicitement que vous n’êtes **pas** dans le cas B (participation déjà nette) — le moteur ajoute alors un rappel dans les `notes` du résultat.

## Règle pack `credit-impot-garde-hors-domicile`

Paramètres lus par le moteur (voir règle dans le fichier de pack, pas recopiés ici pour éviter la dérive) :

| Paramètre (typique) | Rôle |
| -------------------- | ---- |
| `rate` | Taux appliqué à la base éligible plafonnée (souvent **0,5**). |
| `maxEligibleExpensePerChildFullCustodyEur` / `…SharedCustodyEur` | Plafond de **dépenses éligibles** par enfant selon la garde. |
| `maxCreditPerChildFullCustodyEur` / `…SharedCustodyEur` | Plafond de **crédit d’impôt** par enfant (cohérent avec le barème). |
| `deductCmgFromBase` | Si **`true`** : la base éligible annuelle est dérivée de la participation annuelle **moins** la CMG annuelle (dans les limites du positif). Si **`false`** : la CMG n’est pas retirée de cette base (saisie « nette » côté participation + CMG à 0, ou modélisation pack spécifique). |

L’agent et les humains doivent **lire la valeur réelle** dans le pack pour le dossier courant.

## Trace (`partial`) — équivalents mensuels

- `monthlyCreditEquivalentEur` = crédit d’impôt annuel ÷ **12** : **mensualisation pédagogique** du crédit, pas le calendrier réel des avances / restitutions d’impôt.
- `netMonthlyBurdenAfterCreditEur` : effort mensuel **après** cette mensualisation — à ne pas confondre avec un prélèvement mensuel réel du fisc.

## Comportement moteur (GARDE-008)

- Ne **recalcule pas** le barème PSU : la participation est une **saisie** (ou une estimation externe). **Simulateur PSU (part familiale)** côté officiel : [Simuler le coût en crèche](https://www.monenfant.fr/simuler-le-cout-en-creche) (monenfant.fr) — à ne pas confondre avec « Estimer vos droits » CAF (aides). **Agent (intake)** : **fournir ce lien** en proposant d’estimer ; sinon hypothèse explicite ; voir `INTAKE.md` du skill.
- **Crédit d’impôt** : taux, plafonds par enfant et traitement CMG sur la base éligible selon la règle `credit-impot-garde-hors-domicile` du pack.
- **Non-cumuls** (CESU, autres modes) : voir règles qualitatives dans le pack et `docs/research/` — pas d’arbitrage automatique ici.
