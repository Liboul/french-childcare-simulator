# Intake — ordre des questions

1. **Slug** : `creche-publique` \| `creche-berceau-employeur` \| `assistante-maternelle` \| `nounou-domicile`.
2. **Paramètres** : pour **chaque** champ, lire `src/scenarios/<slug>/params.md` (noms exacts, unités).

### Aides CAF / MSA — complément mode de garde (CMG)

Dès que tu collectes un montant de **CMG** (`monthlyCmgStructureEur` en structure, `monthlyCmgPaidEur` ou revenu pour barème en emploi direct) :

- **Ne pas** présenter le montant comme garanti sans contexte : rappeler que l’**éligibilité** (ressources, mode de garde, structure / agrément, etc.) relève du **dossier** CAF ou MSA — le moteur **applique** la saisie, il **ne** valide **pas** les droits.
- **Proposer** de prendre le montant sur l’**avis d’allocations** ou l’**espace personnel** plutôt qu’une estimation si l’utilisateur hésite.
- **Outil officiel** pour une **première estimation** des aides (dont CMG selon cas) : **[Estimer vos droits](https://wwwd.caf.fr/redirect/estimer-vos-droits)** (CAF) ; pour les régimes MSA, l’équivalent sur le site MSA. Ce n’est **pas** le simulateur PSU crèche (voir section crèche ci-dessous).
- Si l’utilisateur utilise des **CESU préfinancés employeur** **et** une CMG **> 0** (berceau, nounou, ou assmat avec l’indicateur `prefinancedCesuEmployerUses`), le résultat peut inclure une **note** sur le **non-cumul** documenté (règle pack `cesu-cmg-non-cumul`) : **pas** d’effacement automatique du CMG — renvoi vers le dossier et la déclaration (cases **7DB / 7DR** selon situation).

### Crèche publique & berceau employeur — `monthlyParticipationEur`

Le moteur **ne calcule pas** le barème PSU : la participation est une **saisie** (voir `params.md`). Dès que tu dois collecter ce montant :

- **Ne pas** seulement demander « quelle participation payez-vous ? ».
- **Proposer en même temps** d’**estimer** la participation si l’utilisateur ne la connaît pas. **Fournir au minimum** le lien vers le simulateur **officiel** de reste à charge crèche **PSU** (barème national) : **[Simuler le coût en crèche](https://www.monenfant.fr/simuler-le-cout-en-creche)** sur [monenfant.fr](https://www.monenfant.fr/) (résultat indicatif). **Ne pas** présenter seul le hub « Estimer vos droits » CAF / MSA comme équivalent : il vise surtout les **aides** (CMG, etc.), pas la part familiale PSU. À défaut : **hypothèse chiffrée** explicite pour la comparaison (ex. « on prend 300 € pour illustrer »), en rappelant que ce n’est **pas** un calcul PSU issu du script.
- **Demander** si la **crèche accepte le paiement par chèques CESU** : `childcareProviderAcceptsCesu` (`true` / `false`) — information trésorerie (le moteur ne modifie pas le F8 pour cela).
- Une fois le montant (facture, simulation externe ou hypothèse acceptée) fixé, passer `monthlyParticipationEur` à `simulate.mjs`.

### Assistante maternelle & nounou à domicile — `monthlyEmploymentCostEur`

Ce champ est le **coût employeur mensuel** (salaire + cotisations) **avant** aides — une **saisie** ; le moteur ne reconstitue pas un bulletin de paie ligne à ligne (voir **Assiette unique** dans `params.md`). Dès que tu dois collecter ce montant :

- **Ne pas** seulement demander « quel coût employeur ? ».
- **Proposer en même temps** d’**estimer** si l’utilisateur ne le connaît pas : **simulateur Urssaf** ou outil **emploi à domicile** (net-entreprises, fiches officielles salaire minimum / grilles conventionnelles selon le cas), **ordre de grandeur** salaire + charges, ou **hypothèse chiffrée** explicite pour la comparaison (ex. « on part sur 900 € / mois »), en rappelant que c’est une **approximation** (pas une reconstitution détaillée des lignes de paie).
- Une fois le montant fixé, passer `monthlyEmploymentCostEur` à `simulate.mjs`.

### Nounou à domicile — employeur unique vs co-famille

Pour **`nounou-domicile`** uniquement, **demander systématiquement** : la nounou est-elle employée **par votre foyer seul à 100 %** pour ce contrat, ou en **co-famille** (plusieurs foyers employeurs) ?

- **`full_single_employer`** : un seul employeur pour ce contrat — les coûts saisis sont ceux du foyer.
- **`co_famille`** : plusieurs employeurs — **saisir la part** de coût et de CMG **de ce foyer** (ou simuler par foyer) ; le moteur ne répartit pas entre foyers. Optionnel : indiquer la **part % de ce foyer** pour la lisibilité du bilan : `coFamilleHouseholdCostSharePercent` (0–100) — **information** ; les montants calculés restent ceux saisis pour ce foyer.

Champ JSON : `nounouEmploymentModel` (`"full_single_employer"` \| `"co_famille"`).

### Assistante maternelle — CESU préfinancé employeur (indicateur)

Pour **`assistante-maternelle`** : **poser** si l’employeur propose des **CESU préfinancés** pour cette garde. Champ booléen **`prefinancedCesuEmployerUses`** (pas de montant ni mode dans ce slug) — sert aux **notes** si CMG > 0 (interaction documentée dans le pack).

### Frais annexes (tous les slugs)

**Demander** si l’utilisateur a des **frais en plus** du coût de garde modélisé (repas, transport, adhésion, etc.) : champ commun **`monthlyAncillaryCostsEur`** (€ / mois, défaut 0). Ils sont **ajoutés** au reste à charge après crédit pour un **effort total** estimé (`estimatedMonthlyHouseholdCashOutEur` dans la trace) — **hors** plafond F8 ou crédit 199 si la facture ne les intègre pas ou s’ils ne sont pas éligibles (voir `params.md`).

### Berceau employeur & nounou — chèques CESU préfinancés (employeur)

Pour **`creche-berceau-employeur`** et **`nounou-domicile`**, **poser systématiquement** la question : l’employeur propose-t-il des **chèques CESU préfinancés** pour la garde ?

- Si **non** : `prefinancedCesuEmployerUses: false` (ou omettre, équivalent à false pour l’agent).
- Si **oui** :
  1. **Montant** : `prefinancedCesuMonthlyEur` (nounou, € / mois) et/ou `prefinancedCesuAnnualEur` (berceau, € / an selon ce que l’utilisateur connaît).
  2. **Mode** (`prefinancedCesuMode`, **obligatoire** si `prefinancedCesuEmployerUses: true`) :
     - **`on_top`** : CESU **en plus** du coût employeur / de l’aide déjà pris en compte dans la saisie — la **charge employeur totale** affichée = coût saisi **+** CESU (trace `totalEmployerOutlayMonthlyEur` ou `totalEmployerChildcareSupportAnnualEur`).
     - **`substitutes_constant_employer_cost`** : **arbitrage** avec le salaire / l’aide pour que le **coût employeur total** reste le même — la saisie `monthlyEmploymentCostEur` ou `annualEmployerChildcareAidEur` représente déjà **l’enveloppe** ; le CESU est une **répartition** de cette enveloppe (pas un surcoût supplémentaire dans la trace « total »).
  3. **Acceptation par la garde** : la **crèche** ou la **nounou** accepte-t-elle le paiement par CESU ? — `childcareProviderAcceptsCesu` (`true` / `false`) pour **`creche-berceau-employeur`** et **`nounou-domicile`** (et pour **`creche-publique`** la question porte sur la crèche).
  4. **Autres usages des CESU** : une partie des chèques sert-elle à **autre chose** que cette garde (ménage, etc.), auquel cas ils ne sont **pas disponibles à 100 %** pour la garde ? — `prefinancedCesuAvailableForChildcareFraction` entre **0** et **1** (ex. `0.6` si 60 % du volume CESU peut servir à cette garde). Défaut **1** si tout est disponible.

Le moteur conserve **CMG et crédit d’impôt** sur l’assiette `monthlyEmploymentCostEur` (nounou) et le seuil employeur sur `annualEmployerChildcareAidEur` (berceau) ; les lignes CESU **documentent** le soutien employeur et le total estimé (CESU **effectif** = montant × fraction). Voir `params.md` des scénarios.

3. **Lancer le calculateur** avec un **objet JSON** contenant **uniquement** ces champs (types : nombres finis, entiers positifs où indiqué, `custody` = `"full"` \| `"shared"`).
4. **Optionnel (tous slugs)** : `revenuNetImposableEur` + `nombreParts` **ensemble** — active un bloc `creditVsIrBrutSatellite` dans `result.trace` : cohérence **crédit d’impôt garde** vs **IR brut indicatif** (pas de double comptage avec `netMonthlyBurdenAfterCreditEur`, qui intègre déjà le crédit).

### Revenus & fiscalité — saisie ou avis d’imposition

Quand tu collectes des **revenus du foyer** ou des données **fiscales** utiles au scénario (ex. **`revenuNetImposableEur`** + **`nombreParts`**, ou **`monthlyHouseholdIncomeForCmgEur`** pour le barème CMG si prévu par `params.md`) :

- **Proposer en parallèle** de la saisie orale : **joindre** (upload PDF / image) les **avis d’imposition** des **années pertinentes** (en pratique : **dernier avis** reçu et, si besoin de cohérence avec une année de référence différente, **N-1** ou **N-2** selon ce que couvre la question — ex. revenu fiscal de référence, quotient familial).
- **T’en servir** pour **extraire** ou **vérifier** les montants (revenu net imposable, nombre de parts, indices utiles pour le revenu mensuel foyer) au lieu de tout demander de tête.
- **Limite technique** : `simulate.mjs` **n’ingère pas** les fichiers — une fois les valeurs connues, l’appel reste un **JSON numérique** avec les clés du scénario.
- **Confidentialité** : rappeler que le document est **sensible** ; l’utilisateur peut **refuser** l’upload et ne fournir que des chiffres saisis.

## Passer les paramètres à `simulate.mjs`

**Un seul script** ; les clés **diffèrent par slug** — pas de mélange.

| Mode                          | Exemple                                                                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **3ᵉ argument** (chaîne JSON) | `node scripts/simulate.mjs creche-publique '{"monthlyParticipationEur":300}'`                                                              |
| **Variable d’environnement**  | `SIMULATE_INPUT='{"monthlyEmploymentCostEur":800,"monthlyHouseholdIncomeForCmgEur":3000}' node scripts/simulate.mjs assistante-maternelle` |
| **Stdin** (3ᵉ arg = `-`)      | `echo '{"monthlyParticipationEur":280}' \| node scripts/simulate.mjs creche-publique -`                                                    |

Sans JSON (ou `{}`) : le moteur tourne avec **stub** si les champs obligatoires pour un calcul partiel manquent.

## Si ça échoue

- **`error: "json_parse"`** : JSON invalide — corriger la chaîne.
- **`error: "validation"`** : clé inconnue, mauvais type, ou valeur hors contrainte — lire `issues` et **`allowedKeys`** dans la sortie ; recouper avec `params.md`.

Ensuite : présenter le **tableau** (`tableau.lignes`) et le **résultat** (`result`) à l’utilisateur.
