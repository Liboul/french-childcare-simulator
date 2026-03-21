---
name: comparatif-modes-garde-fr-2026
description: Garde enfants FR 2026 — exécute toujours node scripts/simulate.mjs sur un JSON ScenarioInput ; brut, CMG, crédit impôt, reste à charge.
---

# Comparatif modes de garde (France, 2026)

## Rôle

Tu **orchestrates** la collecte des données et l’appel au **calculateur**, tu ne recalcules **jamais** les montants à la main.

## Règle non négociable — simulation

Dès que tu as un objet JSON **`ScenarioInput`** valide (ou dès que tu veux **vérifier** un brouillon), tu **dois** lancer le moteur embarqué :

```bash
node scripts/simulate.mjs chemin/vers/scenario.json
```

ou, si le JSON est sur **stdin** :

```bash
node scripts/simulate.mjs - < chemin/vers/scenario.json
```

- **Sortie standard** : document JSON complet du résultat moteur (`snapshot`, `warnings`, `trace`, `meta`, etc.) — c’est la **seule** source de vérité pour les montants.
- **Sortie erreur** : si validation impossible, JSON avec `error: "validation_failed"` et `issues[]` — complète les champs manquants puis **relance** `simulate.mjs`.
- **Interdit** : estimer CMG, crédit d’impôt ou reste à charge sans avoir **au moins une fois** exécuté `simulate.mjs` pour ce scénario (sauf si l’utilisateur te colle déjà une sortie complète du même script).

Pour **comparer plusieurs modes**, construis **un JSON par mode** et exécute **une fois par fichier** (le moteur calcule **un** mode par requête).

## Contexte d’exécution

- **Skill ZIP (claude.ai)** : le bundle contient **`scripts/simulate.mjs`** (Node, dépendances incluses). Active **l’exécution de code** dans les paramètres du compte si requis. Pas d’API HTTP ni de serveur à lancer : **uniquement** ce script.
- **Dépôt complet + Bun** (Claude Code, etc.) : tu peux aussi `bun run demo:scenario docs/demo-scenarios/<fichier>.json` ou importer `harness/handle-calculate.ts` — même logique que `simulate.mjs`.

## Ressources du skill

- **`INTAKE.md`** : ordre des questions pour remplir `ScenarioInput`.
- **`REFERENCE.md`** : champs par `mode`, limites moteur.
- **`scenario-input.schema.json`** : contrat JSON.
- **`examples/*.json`** : gabarits à copier puis adapter avant de passer à `simulate.mjs`.

## Procédure

1. Suis **`INTAKE.md`** puis **`REFERENCE.md`** pour les champs par `mode` ; pose des questions **progressives**.
2. Écris le JSON dans un fichier (ou pipe stdin), puis exécute **`node scripts/simulate.mjs …`**. En cas de **`validation_failed`**, relis `issues[]` et corrige.
3. Présente **snapshot**, **warnings**, **limitationHints**, **uncertainty**, **`meta`** (versions) ; rappelle les limites (TMI / IR optionnels via `incomeTax`, crèche publique / PSU, etc.).

## Transport de la nounou (`nounou_domicile`, `nounou_partagee`)

**Question systématique** : le foyer **rembourse-t-il** (ou prend-il en charge) les **frais de transport** de la salariée (ex. abonnement **Navigo** en Île-de-France) ?

- **Non** : dans `domicileComplementaryCosts`, mets `fraisTransportBase`: `"non"` et **aucun** montant transport (ou `0`).
- **Oui** : clarifie le **type de titre** : **Navigo mois plein**, **demi-tarif** (tarif réduit / solidarité selon les fiches IDFM), **forfait zones limitées**, ou **autre**. **Consulte le prix en vigueur** sur le site officiel **Île-de-France Mobilités** — fiche « Forfait Navigo Mois » : https://www.iledefrance-mobilites.fr/titres-et-tarifs/detail/forfait-navigo-mois — ou https://www.navigo.fr/ ; **ne pas** inventer un € sans source à jour. Saisis le **coût mensuel réellement supporté par ce foyer** dans `fraisTransportMensuelEur` (remboursement du titre ou part convenue, selon la déclaration utilisateur) et `fraisTransportBase` parmi `navigo_mois_plein` | `navigo_demi_tarif` | `navigo_zones_limitees` | `autre`.

Voir aussi **`INTAKE.md`** § nounou.

## Analyse comparative et nounou à domicile

Lorsque l’utilisateur compare plusieurs modes et choisit **nounou à domicile**, demande **toujours** si l’emploi est **exclusivement** pour son foyer ou **partagé** avec un ou plusieurs **autres foyers** (co-emploi, répartition du coût convenue, ex. 50 % / 50 %).

- Si **partagé** : renseigne `brutInput.householdShareOfEmploymentCost` avec la **quote-part du coût d’emploi** supportée par ce foyer (nombre entre 0 et 1, ex. `0.5`). Saisis alors `hourlyGrossEur` et `hoursPerMonth` comme le **contrat / volume total** avant répartition (salaire brut total × heures totales), pour que le moteur applique la part au salaire et aux cotisations patronales du foyer.
- Fais **cohérents** les champs CMG `hourlyDeclaredGrossEur` et `heuresParMois` avec ce que **ce foyer déclare** à la CAF (souvent les heures et montants correspondant à sa quote-part, pas le contrat agrégé). Un avertissement moteur rappelle cet alignement lorsque la part est inférieure à 1.
- Alternative moteur : le mode `nounou_partagee` avec `simultaneousChildrenCount: 1` et `householdShareOfSalary` reprend une logique proche et ajoute une **majoration** si plusieurs enfants sont accueillis **simultanément** par la même garde ; pour un simple partage entre foyers sans majoration « simultanés », préfère `nounou_domicile` + `householdShareOfEmploymentCost`.
- **Autres coûts complémentaires** (congés, lissages fin de contrat, etc.) : remplis `brutInput.domicileComplementaryCosts` selon **`REFERENCE.md`** ; le **transport** suit la section **Transport de la nounou** ci-dessus. Présente **`monthlyBrutTaxCreditAssietteEur`** quand il diffère du brut total.

## Rappels

- Le moteur reste soumis aux **limites** listées dans **`REFERENCE.md`** (IR, crèche publique, annualisation CI, etc.).
- Sources officielles : dans le dépôt, `docs/SOURCES_OFFICIELLES.md` ; sinon résumer Service-Public / CAF / impots.gouv / URSSAF.
