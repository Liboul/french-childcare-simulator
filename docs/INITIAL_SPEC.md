# Spécification initiale — Garde d’enfants (France), orientation agent

## 1. Rôle du document

Ce document définit le **produit** et les **contraintes d’architecture** pour un dépôt reparti **à zéro** : moins de code, plus d’utilité pour un **agent IA** qui doit accompagner un utilisateur dans la **simulation d’un scénario de garde** (et, le cas échéant, la **comparaison** entre scénarios).

L’objectif n’est pas de maximiser les fonctionnalités dans du code fourni **sous forme de scripts isolés**, mais de fournir une **interface claire** (scripts packagés dans un skill, documentation des paramètres, rendus obligatoires) pour que l’agent sache **quels scénarios existent**, **comment les paramétrer**, **où lire les règles**, et **comment présenter un bilan complet et vérifiable**.

> **Ancienne base** : le code et la doc historiques ont été déplacés sous `./trash/` pour permettre une réimplémentation sélective (copie de morceaux utiles), sans hériter d’une structure devenue trop lourde par rapport à cet objectif.

---

## 2. Objectif produit

Fournir un **skill** (Agent Skills, instructions + artefacts exécutables) qui permet à un agent de :

1. **Lister** les **modes de garde / scénarios supportés** et leurs **variations** (comme les recherches approfondies actuelles le suggèrent : barèmes locaux, options employeur, co-gardes, etc.).
2. Pour chaque scénario, **calculer** un résultat **riche** (pas seulement un « coût final ») : toutes les informations pertinentes pour une décision (dépenses, aides, crédits, fiscalité, effets sur le brut / le net, coût employeur, etc.).
3. **Rendre** systématiquement un **tableau de bilan** exigeant (voir § 6), avec **formules** et **sources** par ligne.
4. **Guider** l’utilisateur quand un paramètre est **inconnu** ou **difficile** : questions ciblées, ou **sous-simulation** dédiée (ex. estimation CMG « structure »), elle aussi packagée dans le skill.
5. Répondre clairement à la question : **« Que puis-je faire avec ce skill ? »** (voir § 8), avec explications et exemples types.

Le résultat doit rester une **aide à la simulation**, pas un conseil fiscal ou juridique personnalisé ; les **sources officielles** et l’**explicitation des hypothèses** sont obligatoires.

---

## 3. Périmètre des scénarios (v1 cible)

Chaque ligne ci-dessous est un **scénario produit** au sens « fonction métier + packaging skill ». Les **variations** (crèche municipale vs intercommunale, taux réduit, nombre d’enfants, etc.) sont des **paramètres** et/ou des **variantes documentées** dans la fiche du scénario, pas nécessairement des fichiers séparés au premier abord.

| Scénario                                      | Description courte                                                                                                                                                                        | Variations typiques (non exhaustif)                                                                                           |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Crèche publique**                           | Garde en structure publique, participation famille, **PSU** / revenus, éventuels frais.                                                                                                   | Tarif local (commune / CAF), tranche de revenus, âge, quotité, jours ouvrés, frais de cantine.                                |
| **Crèche avec berceau payé par l’entreprise** | Prise en charge employeur (berceau inter-entreprises ou équivalent) avec effets sur **salaire brut**, **avantage en nature** ou exonération selon cas, comparaison au **coût employeur**. | Plafonds d’exonération, quote-part salariale, impact sur l’IR / le net, cumuls avec autres avantages.                         |
| **Assistante maternelle**                     | Emploi / accueil en MAM selon périmètre retenu ; cotisations ; **CMG** mode « agréé » ; crédit d’impôt selon assiette.                                                                    | Horaires, rémunération, indemnités d’entretien / repas, MAM vs accueil individuel, nombre d’enfants accueillis chez l’assmat. |
| **Nounou à domicile (seul ou co-famille(s))** | Emploi direct ; PAJE / CESU / cotisations ; **CMG** garde à domicile ; crédit d’impôt emploi à domicile ; coûts complémentaires (transport, congés, etc.).                                | Mono-employeur vs **co-employeurs** / répartition des heures et des coûts, aides déjà consommées ailleurs, non-cumuls.        |

Les **recherches approfondies** (`docs/research/`, prompts **DR-\***) servent à **élaborer et auditer** règles, plafonds et non-cumuls dans le **dépôt**. Le **package skill** livré à l’agent **n’embarque pas** ces rapports bruts : il contient le **distillat** utile à la simulation — surtout **`config/`**, le **code**, et la **documentation paramètres / scénarios** (voir [`docs/packaging/README.md`](packaging/README.md)).

---

## 4. Architecture logicielle orientée agent

### 4.1 Principe directeur

- **Une fonction (scénario) = beaucoup de paramètres d’entrée → un objet résultat structuré** (montants, intermédiaires, métadonnées, avertissements, références de règles).
- Le corps des fonctions scénario doit rester **lisible** : surtout des **formules mathématiques simples** et des **conditions simples** (seuils, éligibilité).
- Toute logique **réutilisable** (ex. **salaire net à partir du brut**, barème IR simplifié, décote, estimation d’une aide à partir des revenus) est **extraite** dans des **modules ou scripts dédiés**, **exposés** dans l’interface du skill (script exécutable + doc), et **testée** séparément.

### 4.2 Triple livrable par scénario

Pour chaque scénario, le dépôt doit fournir :

1. **Script exécutable** (ex. Node/Bun, aligné sur le stack du repo) — point d’entrée pour l’agent ou l’utilisateur en local.
2. **Code source** du même script **inclus dans le package skill** pour que l’agent puisse **adapter** le calcul si le paramétrage ne suffit pas.
3. **Documentation Markdown des paramètres** : pour **chaque** paramètre d’entrée, sens, unité, origine (utilisateur vs estimé vs défaut), lien vers la règle ou la source, et comportement si **manquant** (question à poser, estimation via internet, ou appel à une sous-fonction de simulation, ou autre, à adapter en fonction du paramètre).

### 4.3 Fonctions de rendu

- Chaque scénario expose une fonction (ou module) **`renderBilanTableau`** (nom exact à figer par convention) qui produit un **tableau** structuré (modèle de données + optionnellement Markdown/HTML) **aligné sur le § 6**.
- Le modèle est **libre** d’améliorer l’UX (graphiques, résumé en prose), mais **ne dispense pas** du tableau complet exigé par le skill (voir § 6 et § 8).

### 4.4 Simulations satellites

Lorsqu’un paramètre est **coûteux à obtenir** (ex. montant exact de CMG pour une structure), le skill doit proposer :

- soit une **collecte** guidée (questions ordonnées) ;
- soit une **fonction de simulation auxiliaire** (ex. « estimation CMG structure à partir du QF / des revenus »), **également packagée**, documentée, et traçable sur ses hypothèses.

---

## 5. Contenu du résultat d’un scénario (au-delà du « coût final »)

Le résultat renvoyé par la fonction scénario doit permettre de répondre à des questions du type :

- « À **coût pour mon employeur équivalent**, vaut-il mieux le **berceau** (avec baisse du brut) ou une **nounou** pour mes trois enfants ? »

Pour cela, le bilan inclut notamment :

- **Coût des salariés pour l’employeur** (charges comprises), pour supporter le scénario qui implique un arbitrage employeur / salaire / avantage en nature.
- **Revenus bruts** des deux membres du foyer (ou du périmètre fiscal retenu).
- **TMI** (ou approximation documentée) et, si pertinent, **impôt sur le revenu** annuel ou variation marginale selon hypothèses du modèle.
- **Dépenses mensuelles** à débourser pour la garde (ligne par ligne).
- **Aides** (CAF, CMG, participation employeur, etc.) et **crédits d’impôt**, avec ordre d’imputation lorsque c’est pertinent. Les aides dépendent du scénario.
- **Coût réel pour le foyer** dans ce scénario, défini comme **écart** par rapport à une **situation de référence** « sans ce mode de garde à payer » (même méthode de calcul, mêmes revenus de base sauf effets induits par le scénario — ex. brut différent si berceau).

Les **intermédiaires de calcul** (assiettes, plafonds appliqués, taux) font partie du résultat structuré, pas seulement du texte explicatif.

---

## 6. Tableau de bilan obligatoire (rendu)

### 6.1 Exigence

Le **README principal du skill** doit indiquer **explicitement** que l’agent doit **toujours** produire un **tableau complet et précis** du bilan pour le scénario traité, et qu’**omettre** des lignes importantes ou les **sources** est une **erreur d’usage** du skill.

### 6.2 Structure minimale des colonnes

Le tableau (ou équivalent structuré puis rendu en tableau) doit comporter au minimum :

| Colonne              | Rôle                                                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Libellé**          | Ligne du bilan (ex. « Cotisations salariales », « CMG », « Crédit d’impôt emploi à domicile »).                         |
| **Montant**          | Valeur principale (€ / mois / an selon convention documentée pour le scénario).                                         |
| **Calcul / formule** | Expression ou enchaînement lisible (ex. « min(plafond ; 50 % × base) »), renvoyant aux paramètres numériques utilisés.  |
| **Sources**          | Lien(s) vers la règle officielle ou la référence légale (Service-Public, CAF, impots.gouv, URSSAF, collectivité, etc.). |

Des colonnes supplémentaires (période, commentaire, id de règle dans `config/`) sont les bienvenues si elles améliorent la traçabilité.

### 6.3 Couverture métier du tableau

Le tableau doit couvrir **toutes** les lignes nécessaires au scénario, en particulier :

- Les **grandes masses** du **bilan fiscal / social du foyer** pertinentes pour la comparaison (bruts, cotisations si modélisées, impôt, disponible).
- Le **chemin complet** depuis les **revenus et charges côté employeur** (si applicable) jusqu’au **reste à charge** du foyer.
- Les **aides** et **crédits** avec **références** rappelant **non-cumul**, **plafonds** et **ordre** d’application lorsque le moteur en tient compte.

---

## 7. Transparence, sources et incertitude

- Chaque montant « réglementé » doit être **lié** à une **règle** identifiée dans le pack de config versionné ou à un marqueur **`todoVerify`** / incertitude explicite.
- Aucun plafond ou taux ne doit être **présenté comme acquis** sans source ou sans étiquette d’hypothèse.
- Si une règle est floue ou non publiée pour l’année cible : **signal isolé**, variante paramétrable, ou **refus de calcul** avec message structuré — aligné sur l’esprit des garde-fous du plan sprint (voir § 10).

---

## 8. « Que puis-je faire avec ce skill ? »

Le package skill doit contenir une section **réponse toute faite** (FAQ ou bloc dédié dans le README) qui explique, en langage clair :

- **Comparer** des modes de garde sur une base **coût réel** vs **référence sans garde**.
- **Modéliser** l’impact d’un **berceau employeur** vs une **garde à domicile** ou une **crèche**, en incluant **employeur + salarié + foyer**.
- **Obtenir** le **détail des calculs** et les **sources** pour **vérifier** ou **discuter avec un professionnel**.
- **Compléter** les paramètres manquants grâce aux **guides** et **sous-simulations**.

**Exemples** (à rédiger en version finale dans le README du skill) :

1. Couple avec deux enfants, hésitation entre **crèche municipale** et **assmat**, revenus et tarifs locaux donnés.
2. **Berceau d’entreprise** : impact sur le **brut** et comparaison au **coût employeur** d’une **nounou** à temps partiel.
3. **Co-famille** : répartition des heures et des dépenses, non-cumuls d’aides.

---

## 9. Configuration, tests, traçabilité

- Les **barèmes et plafonds** vivent dans des fichiers **versionnés** (ex. `config/`), jamais dispersés comme constantes magiques dans les scénarios.
- Les **tests** couvrent les fonctions pures (argent, plafonds, cumuls) et au moins un **chemin complet** par scénario majeur.
- Un **journal de calcul** (étapes + références) reste **souhaitable** dans le résultat JSON pour audit — le détail exact sera précisé dans les stories de bootstrap moteur.

---

## 10. Mode opératoire projet (philosophie conservée)

Les principes suivants, issus de la gouvernance du dépôt avant reset, **restent en vigueur** ; le fichier `docs/SPRINT_PLAN.md` sera **recréé** sur ce modèle lors du prochain bootstrap doc.

### 10.1 Sprints et stories

- Identifiants **`GARDE-###`** pour les livrables ; référence dans les **messages de commit** : `GARDE-###: description courte`.
- Chaque story a une spec **`docs/stories/GARDE-###.md`** (template : valeur produit, périmètre, critères d’acceptation, notes techniques, recherche approfondie oui/non, plan de tests, risques, checklist done).
- **Définition of Done** : spec à jour, implémentation conforme à cette `INITIAL_SPEC`, tests, commit étiqueté, mise à jour du **journal de complétion** dans `SPRINT_PLAN.md`, traitement explicite de l’**incertitude**.

### 10.2 Garde-fous « vibe coding »

- Pas de règle fiscale silencieuse : données sourcées ou `TODO-VERIFY`.
- **Une seule source de vérité** pour les chiffres (fichiers de config).
- **Traçabilité** avant polish UI.
- **Petits commits**, pas de refactor gratuit hors story.
- **Recherche approfondie** : lorsque nécessaire, le **propriétaire du projet** exécute les prompts **DR-\*** dans un outil externe ; l’agent ne remplace pas cette étape par de la navigation ad hoc.

### 10.3 Stack technique (par défaut)

Sauf décision contraire documentée en story :

| Élément           | Choix                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------- |
| Langage           | **TypeScript** strict                                                                  |
| Runtime / paquets | **Bun**                                                                                |
| Tests             | **Bun test**                                                                           |
| Lint / format     | **ESLint** + **Prettier**                                                              |
| CI                | Pipeline type **GitHub Actions** (`bun run ci` : typecheck, lint, format check, tests) |

### 10.4 Livraison « moteur + skill »

Le produit a deux couches :

| Couche              | Rôle                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------- |
| **Cœur**            | Fonctions scénario, config, tests, exports structurés                                        |
| **Skill / harness** | Instructions, scripts packagés, INTAKE, exemples, ZIP ou chemins repo — selon ADR à réécrire |

---

## 11. Formats de sortie

Le résultat structuré (JSON) est la **source de vérité** pour l’agent. Les rendus **Markdown / HTML / CSV** sont **dérivés** et doivent inclure **hypothèses**, **détail des calculs**, et **sources**, en cohérence avec le tableau du § 6.

---

## 12. Prochaines étapes (hors périmètre de ce fichier)

1. ~~Recréer **`docs/SPRINT_PLAN.md`**, **`docs/CONVENTIONS.md`** et la structure **`docs/stories/`**~~ — fait ; voir [`SPRINT_PLAN.md`](./SPRINT_PLAN.md).
2. Implémenter les **scénarios** et le **packaging skill** (**distillat** dans l’archive — voir [`packaging/README.md`](packaging/README.md)) selon les stories du plan.
3. Poursuivre la reprise depuis `./trash/` au besoin (moteur, traces) ; **`docs/research/`** est réintégré dans le dépôt (pas dans le package skill).

---

## 13. Résumé en une phrase

**Un skill minimal en code mais maximal en clarté pour l’agent : scénarios explicites, scripts et sources livrés, bilans comparables du coût employeur au reste à charge réel, avec tableau obligatoire, formules et liens officiels.**
