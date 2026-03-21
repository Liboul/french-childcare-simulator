---
name: comparatif-modes-garde-fr-2026
description: >
  Estimation transparente des coûts de garde d'enfants en France (2026) via le moteur du dépôt
  agent-comparatif-modes-de-garde — brut, CMG, crédit d'impôt simplifié, reste à charge, incertitudes.
---

# Comparatif modes de garde (France, 2026)

## Rôle

Tu **orchestrates** la collecte des données et l’appel au **calculateur**, tu ne recalcules pas les montants à la main.

## Contexte d’exécution

- **Dépôt complet clone** (Claude Code, etc.) : tu as `src/`, `config/`, Bun → exécute le moteur **dans le repo**.
- **Archive skill seule** (ZIP claude.ai) : tu n’as en général **pas** le moteur TS ; utilise **`INTAKE.md`** (ordre des questions), **`REFERENCE.md`**, **`examples/*.json`**, **`openapi.yaml`**, **`scenario-input.schema.json`**, et configure un **outil HTTP / MCP** vers une API qui expose `POST /v1/calculate`, **ou** demande à l’utilisateur de coller la sortie d’une exécution locale.

## Outils

- **Préféré avec dépôt + Bun** : `bun run demo:scenario docs/demo-scenarios/<fichier>.json`, ou import `computeScenarioSnapshot` / `harness/handle-calculate.ts` (voir ADR dans le repo : `docs/architecture/ADR-0001-pluggable-provider-harness.md`).
- **Avec ZIP sans repo** : mêmes JSON que les fichiers dans **`examples/`** ; spec **`openapi.yaml`** pour brancher une Action HTTP.
- **HTTP** : `POST /v1/calculate` avec un corps **`ScenarioInput`**. Dev local : `bun run harness:serve` → `http://127.0.0.1:8787/v1/calculate`.

## Procédure

1. Suis **`INTAKE.md`** puis **`REFERENCE.md`** pour les champs par `mode` ; pose des questions **progressives**.
2. Construis le JSON (`household`, `brutInput`, `cmg`, options) et lance le calcul (CLI, code, ou POST). En cas d’erreur **422**, relis `issues[]` pour compléter les champs.
3. Présente **snapshot**, **warnings**, **limitationHints**, **uncertainty**, **`meta`** (versions) ; rappelle les limites (pas de TMI, crèche publique / PSU, etc.).

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
- **Autres coûts complémentaires** (congés, lissages fin de contrat, etc.) : remplis `brutInput.domicileComplementaryCosts` selon **`REFERENCE.md`** et `docs/research/DR-06-EMPLOI-DOMICILE-COUTS-COMPLEMENTAIRES.md` ; le **transport** suit la section **Transport de la nounou** ci-dessus. Présente **`monthlyBrutTaxCreditAssietteEur`** quand il diffère du brut total.

## Rappels

- Moteur **sans TMI** ; crèche publique = CMG souvent `unsupported` dans ce modèle.
- Sources officielles : dans le dépôt, `docs/SOURCES_OFFICIELLES.md` ; sinon résumer Service-Public / CAF / impots.gouv / URSSAF.
