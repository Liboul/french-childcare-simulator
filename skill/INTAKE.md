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

Le moteur **ne calcule pas** le barème PSU et **ne distingue pas** PAJE et PSU dans les clés JSON : une seule saisie **`monthlyParticipationEur`** = ce que le foyer **paie** (ou doit payer) **chaque mois** au titre de la garde en structure, **cohérent** avec la CMG (`params.md`). **À quoi ça correspond** selon le cas :

- **Structure en PSU** (EAJE conventionnée PSU : souvent municipal / intercommunal, et **beaucoup** de crèches privées conventionnées ainsi ; les **crèches inter-entreprises / berceaux** sont **souvent** sur ce pied, mais ce n’est pas universel) : la part familiale suit en principe le **barème national PSU** (ressources, enfants, volume d’accueil). Pour **estimer** sans facture : **[Simuler le coût en crèche](https://www.monenfant.fr/simuler-le-cout-en-creche)** sur [monenfant.fr](https://www.monenfant.fr/) — résultat indicatif. **Ne pas** présenter seul « Estimer vos droits » CAF / MSA comme équivalent : il vise surtout les **aides** (CMG, etc.), pas la part familiale PSU en tant que telle.
- **Structure en PAJE** (sans conventionnement PSU, ou tarification propre à la structure) : ce n’est **pas** le même référentiel assuré que pour le PSU ; le montant **réel** dépend du **tarif fixé par la structure** et des engagements contractuels. **Référence fiable** : **facture** ou **information obtenue auprès de la crèche / du gestionnaire**. Si l’utilisateur ne connaît pas le montant : l’**agent** peut **chercher sur Internet** (site du gestionnaire, informations publiques, ordres de grandeur) pour proposer une **estimation** indicative, en rappelant qu’il faut **confirmer** avec la structure — pas de barème national unique dans le moteur.

Collecte :

- **Ne pas** seulement demander « quelle participation payez-vous ? ».
- **Proposer en même temps** d’**estimer** : selon le cas, **monenfant.fr** (PSU) ou **recherche web + rappel de validation** crèche (PAJE). À défaut : **hypothèse chiffrée** explicite pour la comparaison (ex. « on prend 300 € pour illustrer »), en rappelant que ce n’est **pas** un calcul issu du script.
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

### Berceau employeur — aide employeur, CIF et excédent « salaire » (`creche-berceau-employeur`)

Le montant **`annualEmployerChildcareAidEur`** (ex. prise en charge facture crèche **16 000 € / an**) **n’est pas** automatiquement du **revenu imposable** pour le salarié : selon la **convention** et le **crédit d’impôt famille** (CIF) entreprise, l’employeur peut ne payer **qu’une fraction** du coût (ex. **4 000 €** réels après crédit), l’**arbitrage** avec le **brut** servant à garder un **coût employeur** comparable.

- **Ne pas** laisser le défaut du moteur si l’utilisateur décrit ce cas : le scénario appliquerait sinon un **excédent imposable en salaire** au-delà du seuil pack (1 830 € × n) — **erreur fréquente** pour les berceaux avec CIF.
- Passer **`employerAidSalaryTaxableExcessApplies: false`** lorsque la prise en charge **ne** doit **pas** être modélisée comme avantage imposable pour le salarié (valider au dossier RH / fiscal).
- **Optionnel** : **`annualEmployerNetCostAfterCifEur`** (€ / an) = coût employeur **après** CIF, pour le **bilan** et l’**arbitrage** brut — **information** ; le moteur ne calcule pas le CIF.
- Même logique que pour le CESU en **« même coût total »** : la **réduction de brut** qui préserve la charge employeur **ne** correspond **pas** euro pour euro au montant versé crèche ni au coût net après CIF, à cause des **cotisations patronales** non dues sur la masse non versée (rappel automatique en note / bilan).

Détail : `src/scenarios/creche-berceau-employeur/params.md` (section **Aide employeur — crédit d’impôt famille**).

### Berceau employeur & nounou — chèques CESU préfinancés (employeur)

Pour **`creche-berceau-employeur`** et **`nounou-domicile`**, **poser systématiquement** la question : l’employeur propose-t-il des **chèques CESU préfinancés** pour la garde ?

- Si **non** : `prefinancedCesuEmployerUses: false` (ou omettre, équivalent à false pour l’agent).
- Si **oui** :
  1. **Montant** : `prefinancedCesuMonthlyEur` (nounou, € / mois) et/ou `prefinancedCesuAnnualEur` (berceau, € / an selon ce que l’utilisateur connaît).
  2. **Mode** (`prefinancedCesuMode`, **obligatoire** si `prefinancedCesuEmployerUses: true`) :
     - **`on_top`** : CESU **en plus** du coût employeur / de l’aide déjà pris en compte dans la saisie — la **charge employeur totale** affichée = coût saisi **+** CESU (trace `totalEmployerOutlayMonthlyEur` ou `totalEmployerChildcareSupportAnnualEur`).
     - **`substitutes_constant_employer_cost`** : **arbitrage** avec le salaire / l’aide pour que le **coût employeur total** reste le même — la saisie `monthlyEmploymentCostEur` ou `annualEmployerChildcareAidEur` représente déjà **l’enveloppe** ; le CESU est une **répartition** de cette enveloppe (pas un surcoût supplémentaire dans la trace « total »). **Important** : la **baisse de brut** qui compense ce CESU (ou une prise en charge berceau / CIF) **n’est pas** en général **égale** au montant du chèque ou de la facture, car l’employeur **ne paie pas** les **cotisations patronales** sur la rémunération non versée — le moteur **rappelle** ce point en note / bilan, **sans** calculer le coefficient (paie / RH).
  3. **Acceptation par la garde** : la **crèche** ou la **nounou** accepte-t-elle le paiement par CESU ? — `childcareProviderAcceptsCesu` (`true` / `false`) pour **`creche-berceau-employeur`** et **`nounou-domicile`** (et pour **`creche-publique`** la question porte sur la crèche).
  4. **Autres usages des CESU** : une partie des chèques sert-elle à **autre chose** que cette garde (ménage, etc.), auquel cas ils ne sont **pas disponibles à 100 %** pour la garde ? — `prefinancedCesuAvailableForChildcareFraction` entre **0** et **1** (ex. `0.6` si 60 % du volume CESU peut servir à cette garde). Défaut **1** si tout est disponible.

Le moteur conserve **CMG et crédit d’impôt** sur l’assiette `monthlyEmploymentCostEur` (nounou) ; pour le berceau, le **seuil / excédent salaire** sur `annualEmployerChildcareAidEur` **ne s’applique** que si **`employerAidSalaryTaxableExcessApplies`** est laissé à **`true`** (défaut). Les lignes CESU **documentent** le soutien employeur et le total estimé (CESU **effectif** = montant × fraction). Voir `params.md` des scénarios.

3. **Lancer le calculateur** avec un **objet JSON** contenant **uniquement** ces champs (types : nombres finis, entiers positifs où indiqué, `custody` = `"full"` \| `"shared"`).
4. **Optionnel (tous slugs)** : `revenuNetImposableEur` + `nombreParts` **ensemble** — active un bloc `creditVsIrBrutSatellite` dans `result.trace` : cohérence **crédit d’impôt garde** vs **IR brut indicatif** (pas de double comptage avec `netMonthlyBurdenAfterCreditEur`, qui intègre déjà le crédit). Le RNI est **figé** pour ce satellite : une **baisse de brut** (arbitrage employeur) **abaisserait en principe l’IR** — le moteur **ne** recalcule **pas** l’IR à partir d’un arbitrage hypothétique ; pour comparer, utiliser un RNI **déjà** aligné sur la situation réelle ou une hypothèse **révisée** (voir `params.md` crèche publique, **Satellite**).

### Revenus & fiscalité — saisie ou avis d’imposition

Quand tu collectes des **revenus du foyer** ou des données **fiscales** utiles au scénario (ex. **`revenuNetImposableEur`** + **`nombreParts`**, ou **`monthlyHouseholdIncomeForCmgEur`** pour le barème CMG si prévu par `params.md`) :

- **Proposer en parallèle** de la saisie orale : **joindre** (upload PDF / image) les **avis d’imposition** des **années pertinentes** (en pratique : **dernier avis** reçu et, si besoin de cohérence avec une année de référence différente, **N-1** ou **N-2** selon ce que couvre la question — ex. revenu fiscal de référence, quotient familial).
- **T’en servir** pour **extraire** ou **vérifier** les montants (revenu net imposable, nombre de parts, indices utiles pour le revenu mensuel foyer) au lieu de tout demander de tête.
- **Limite technique** : `simulate.mjs` **n’ingère pas** les fichiers — une fois les valeurs connues, l’appel reste un **JSON numérique** avec les clés du scénario.
- **Confidentialité** : rappeler que le document est **sensible** ; l’utilisateur peut **refuser** l’upload et ne fournir que des chiffres saisis.

### Coût réel pour le foyer et baisse d’IR (arbitrage brut)

Les sorties **`netMonthlyBurdenAfterCreditEur`**, **`estimatedMonthlyHouseholdCashOutEur`**, etc. décrivent surtout l’**effort garde** (trésorerie participation, CMG, crédit d’impôt **garde** / emploi à domicile selon le slug). Si l’utilisateur compare des situations où la **rémunération brute** **baisse** (CESU « même coût employeur », berceau avec arbitrage, etc.), un **coût réel global** pour le ménage peut aussi inclure une **baisse de l’impôt sur le revenu** (RNI plus bas), **non** ajoutée automatiquement aux lignes ci-dessus.

- **Ne pas** présenter le seul `netMonthlyBurdenAfterCreditEur` comme « tout ce que ça coûte au foyer » sans cette nuance lorsque l’arbitrage salarial est en jeu.
- **Proposer** : soit un **deuxième** passage avec **`revenuNetImposableEur`** (et **`nombreParts`**) **révisés** pour refléter le RNI **après** baisse de brut (ordre de grandeur ou avis), soit une **phrase explicite** dans la synthèse : « gain d’IR non modélisé dans le tableau garde ». Voir aussi `params.md` crèche publique (**Satellite**, **Coût réel global**).

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
