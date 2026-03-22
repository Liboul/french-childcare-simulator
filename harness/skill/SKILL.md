---
name: comparatif-modes-garde-fr-2026
description: Garde enfants FR 2026 — simulate.mjs obligatoire ; après chaque run, fiche transparence (entrées ↔ snapshot, trace CI, employeur, aides).
---

# Comparatif modes de garde (France, 2026)

## Rôle

Tu **orchestrates** la collecte des données et l’appel au **calculateur**, tu ne recalcules **jamais** les montants à la main.

## Plafond aide employeur CESU préfinancé (sans recherche web)

Pour le **montant maximal légal** de l’**aide employeur** en CESU préfinancé (par bénéficiaire et par an), tu t’appuies sur **`REFERENCE.md`** § *Plafond légal — aide employeur CESU préfinancé* : avec le pack **2026** du dépôt / du ZIP, c’est **2540 €** (règle pack **`cesu-prefinance-plafond-aide-financiere-employeur`**, paramètre **`maxAnnualAidPerBeneficiaryEur`**). **Interdit** de substituer un chiffre trouvé au hasard sur internet : la **référence** est le **rule pack** versionné (`meta.rulePackVersion` après `simulate.mjs`). Un dépassement de saisie se lit dans **`warnings`** (`cesu_prefunded_exceeds_employer_aid_annual_cap`).

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

- **Skill ZIP** (hôtes Agent Skills, ex. [claude.ai](https://claude.ai), Codex) : le bundle contient **`scripts/simulate.mjs`** (Node, dépendances incluses). Active **l’exécution de code** dans les paramètres du compte si requis. Pas d’API HTTP ni de serveur à lancer : **uniquement** ce script.
- **Dépôt complet + Bun** (Cursor, environnement agent avec clone, etc.) : tu peux aussi `bun run demo:scenario docs/demo-scenarios/<fichier>.json` ou importer `harness/handle-calculate.ts` — même logique que `simulate.mjs`.

## Ressources du skill

- **`INTAKE.md`** : ordre des questions pour remplir `ScenarioInput`.
- **`REFERENCE.md`** : champs par `mode`, limites moteur.
- **`scenario-input.schema.json`** : contrat JSON.
- **`examples/*.json`** : gabarits à copier puis adapter avant de passer à `simulate.mjs`.

## Procédure

1. Suis **`INTAKE.md`** puis **`REFERENCE.md`** pour les champs par `mode` ; pose des questions **progressives** (crèches : participation parentale **obligatoire** ; nounou : transport ; **tout mode** : § 3 bis **partie A ou B** — CESU / aides employeur déductibles ; sections dédiées ci-dessous).
2. Écris le JSON dans un fichier (ou pipe stdin), puis exécute **`node scripts/simulate.mjs …`**. En cas de **`validation_failed`**, relis `issues[]` et corrige.
3. Réponds avec la **fiche transparence** (section suivante) dès qu’il y a une sortie moteur exploitable — **sauf** si l’utilisateur demande explicitement une réponse **ultra-courte** (alors template B seulement).

## Fiche transparence (obligatoire après `simulate.mjs`)

**But** : donner une vue d’ensemble et permettre de **vérifier** chaque poste sans refaire les calculs à la main. Tous les **€** viennent des champs **`snapshot`** (et éventuellement du contexte saisi) ; tu **cites** les clés JSON, tu ne **réinventes** pas les formules.

### Template A — réponse standard

Structure **dans cet ordre** :

1. **Vue d’ensemble (≈30 s)**
   - Mode : `snapshot.mode`
   - Brut : `snapshot.monthlyBrutEur` / `snapshot.annualBrutEur`
   - CMG : `snapshot.monthlyCmgEur`, statut `snapshot.cmgStatus` — si `unsupported` (ex. crèche PSU non modélisée), rappeler que **0 € est une limite du modèle**, pas un jugement sur les droits réels (`limitationHints`, `trace` `scenario_cmg`, CAF).
   - Crédit d’impôt : `snapshot.annualTaxCreditEur`, type `snapshot.taxCreditKind`
   - Reste à charge foyer : `snapshot.netHouseholdBurdenMonthlyEur` / `netHouseholdBurdenAnnualEur`
   - Si renseigné : disponible après charge `snapshot.disposableIncomeMonthlyEur` ; IR / TMI `estimatedIncomeTaxGrossAnnualEur`, `marginalIncomeTaxRate` (voir `warnings` / `limitationHints`). Si `disposableIncomeMonthlyEur` est `null` mais un bloc `incomeTax` est présent : citer **`incomeTaxDisposableHintsFr`** (pourquoi le disponible n’est pas calculé — ex. net bulletin ≠ après IR).
   - **Revenus du foyer** (tels que déclarés dans `incomeTax`, reprise dans le snapshot — ignorer les clés à `null`) :
     - **Salaire brut foyer** : `snapshot.householdGrossSalaryMonthlyEur` / `householdGrossSalaryAnnualEur` (saisie `incomeTax.annualGrossSalaryEur`).
     - **Salaire net (bulletins)** : `snapshot.householdNetSalaryMonthlyEur` / `householdNetSalaryAnnualEur` (`incomeTax.annualNetSalaryFromPayslipsEur` — après cotisations, **avant** IR ; **ne pas** confondre avec le revenu après IR).
     - **Revenu foyer après IR** (si saisi) : `snapshot.householdIncomeAfterIncomeTaxMonthlyEur` / `householdIncomeAfterIncomeTaxAnnualEur`.
   - **Alertes** : résumer `warnings`, `limitationHints`, `uncertainty` (et tout `cmgStatus` ≠ `ok`). Pour `uncertainty.flags`, utiliser **`messageFr`** lorsqu’elle est présente (sinon le `code` stable).

2. **Brut / garde (saisie → moteur)**  
   Tableau ou liste : pour chaque poste important, **colonne saisie** (`brutInput` : mode, heures, salaire, `monthlyParticipationEur`, `employerShareOfGross`, `domicileComplementaryCosts`, part foyer `householdShareOfEmploymentCost`, etc.) → **colonne résultat** (`monthlyBrutEur`, `annualBrutEur`).  
   Si emploi à domicile avec coûts complémentaires : si `monthlyBrutTaxCreditAssietteEur` ≠ `monthlyBrutEur`, **l’expliquer** et citer les deux champs (assiette CI vs brut affiché).

3. **Employeur du foyer (berceau, même coût entreprise)**  
   Si **les deux** montants employeur sont renseignés : citer `employerSupportDeltaAnnualEur` et **`employerSupportIsComparisonScenario`** ; préciser que l’écart **ne modifie pas** `netHouseholdBurden*` (comparaison d’hypothèses uniquement — voir aussi l’étape `trace` `scenario_employer_support_comparison`). Sinon une phrase : pas de variation employeur modélisée pour ce scénario.

4. **Aides et préfinancements**
   - **CMG** : rappeler les paramètres `cmg` **pertinents** (sans tout recopier si le JSON est énorme) et le lien avec `monthlyCmgEur` / `cmgStatus`.
   - **CESU préfinancé (emploi à domicile)** : si `taxCredit.prefundedCesuAnnualEur` > 0, s’appuyer sur **`trace`** `scenario_tax_credit_prefunded_cesu` + **`warnings`**. Pour le **plafond légal de l’aide employeur** (distinct du plafond CI), citer **`REFERENCE.md`** / pack : **2540 € / an / bénéficiaire** avec **`rules.fr-2026`** — **pas** de montant « trouvé sur le web » hors cette référence.
   - **Aide employeur déductible (garde hors domicile)** : si `taxCredit.outsideHomeAnnualEmployerAidDeductibleEur` > 0, rappeler qu’elle **réduit l’assiette** du crédit « garde hors du domicile » (étape **`trace`** `scenario_tax_credit` / routage `garde_hors_domicile`) — citer le montant saisi, **sans** improviser.
   - Ne confonds pas **CESU** avec la **CSG** (cotisation) ; si l’utilisateur dit « CSG » pour des chèques, clarifie poliment.

5. **Crédit d’impôt (pédagogie + trace)**
   - Type `taxCreditKind`, montant `annualTaxCreditEur`.
   - Pour l’**emploi à domicile** : mentionner `annualBrutTaxCreditAssietteEur` quand utile.
   - Ajouter **1 à 3 étapes** issues de `trace.steps` dont le `segment` est parmi `tax_credits`, `taxation`, `family_allowances`, `employer_benefits` ou `childcare` (copier `label` + `formula`, et `narrative` si elle aide) — **pas** de formules improvisées hors trace.

6. **Cohérence et audit**
   - Une phrase sur l’enchaînement tel que le moteur le présente (brut → CMG → CI → reste à charge, selon ce que la sortie reflète).
   - Rappeler : toute **nouvelle hypothèse** ⇒ **relancer** `simulate.mjs`.
   - Citer **`meta.engineVersion`** et **`meta.rulePackVersion`**.

### Template B — réponse courte (sur demande utilisateur)

- Une ligne **synthèse** avec `netHouseholdBurdenMonthlyEur`, `monthlyBrutEur`, `monthlyCmgEur` + `cmgStatus`, `annualTaxCreditEur` + `taxCreditKind`.
- Si non `null` : ajouter **brut / net foyer** (`householdGrossSalaryMonthlyEur`, `householdNetSalaryMonthlyEur`, `householdIncomeAfterIncomeTaxMonthlyEur`) avec intitulés clairs (net bulletin vs après IR).
- **À valider** : lister en 1 ligne les saisies sensibles (participation crèche, heures/salaire garde, revenus `incomeTax`, aide employeur / CESU `prefundedCesuAnnualEur` ou `outsideHomeAnnualEmployerAidDeductibleEur`).
- **Limites** : puces tirées de `warnings` + `limitationHints` (et `meta` si pertinent).

### Plusieurs modes comparés

Après **un run par mode**, ajouter un **tableau** : colonnes Mode | `monthlyBrutEur` | `monthlyCmgEur` | `annualTaxCreditEur` | `netHouseholdBurdenAnnualEur` | `employerSupportDeltaAnnualEur` (si non null).  
Puis **un court paragraphe** sur ce qui explique les écarts (même enfant, mêmes hypothèses employeur si applicable).

## CESU préfinancé et aides employeur déductibles (tous les modes)

**Même exigence que le transport nounou et la participation crèche** : tu **poses** les questions ; tu **n’attends pas** que l’utilisateur s’en souvienne.

**Quand** : **chaque** scénario (`ScenarioInput`), **avant** le premier `simulate.mjs` — y compris **comparaisons** (un JSON par mode : refaire le parcours pour chaque fichier).

- **`nounou_domicile` / `nounou_partagee`** (**partie A**, crédit emploi à domicile) : `taxCredit.prefundedCesuAnnualEur`. Questions : CESU employeur ? puis **complément** vs **substitution** par rapport au **brut URSSAF** (`hourlyGrossEur`, heures). **Plafond aide employeur** : voir section ci-dessus + **`REFERENCE.md`** (**2540 €** / an / bénéficiaire pour le pack 2026 — ne pas rechercher ailleurs).
- **`assistante_maternelle` / `mam` / `creche_*`** (**partie B**, garde hors domicile) : `taxCredit.outsideHomeAnnualEmployerAidDeductibleEur`. Questions : CESU / titres employeur ou aide assimilée **pour cette garde** ? puis **complément** vs **substitution** par rapport aux **dépenses saisies** (participation crèche, coût assmat…). **Ne pas** mettre ces montants dans `prefundedCesuAnnualEur` : le moteur **ignore** ce champ pour ces modes.

Si l’utilisateur cite des CESU **sans** préciser complément/substitution, **tu poses la question tout de suite** — **pas** d’interprétation implicite.

Détail : **`INTAKE.md`** § 3 bis.

## Transport de la nounou (`nounou_domicile`, `nounou_partagee`)

**Question systématique** : le foyer **rembourse-t-il** (ou prend-il en charge) les **frais de transport** de la salariée (ex. abonnement **Navigo** en Île-de-France) ?

- **Non** : dans `domicileComplementaryCosts`, mets `fraisTransportBase`: `"non"` et **aucun** montant transport (ou `0`).
- **Oui** : clarifie le **type de titre** : **Navigo mois plein**, **demi-tarif** (tarif réduit / solidarité selon les fiches IDFM), **forfait zones limitées**, ou **autre**. **Consulte le prix en vigueur** sur le site officiel **Île-de-France Mobilités** — fiche « Forfait Navigo Mois » : https://www.iledefrance-mobilites.fr/titres-et-tarifs/detail/forfait-navigo-mois — ou https://www.navigo.fr/ ; **ne pas** inventer un € sans source à jour. Saisis le **coût mensuel réellement supporté par ce foyer** dans `fraisTransportMensuelEur` (remboursement du titre ou part convenue, selon la déclaration utilisateur) et `fraisTransportBase` parmi `navigo_mois_plein` | `navigo_demi_tarif` | `navigo_zones_limitees` | `autre`.

Voir aussi **`INTAKE.md`** § nounou.

## Participation parentale en crèche (`creche_publique`, `creche_privee`, `creche_inter_entreprises`)

**Question obligatoire** avant `simulate.mjs` : quel montant le **parent paie chaque mois** pour la place (participation familiale / facture crèche) ?

- Tu **demandes explicitement** ce montant en €/mois à l’utilisateur (facture, avis d’échéance, relevé bancaire, espace CAF, courrier de la structure). Tu le mets dans **`brutInput.monthlyParticipationEur`**.
- **Interdit** : lancer une simulation avec `monthlyParticipationEur` **omis** ; **interdit** d’utiliser `0` ou un montant **plausible** sans accord de l’utilisateur (le moteur **ne calcule pas** le barème PSU).
- **Ne pas confondre** : les pages caf.fr « **Estimer vos droits** » et la simulation **CMG / mode de garde** servent surtout à estimer des **aides** (allocations, compléments) — **pas** à remplacer l’outil ci-dessous pour le **prix payé par le parent** en crèche **PSU**.
- **Part salarié / participation familiale (crèche conventionnée PSU)** — à proposer **en premier** si le montant est inconnu :
  - **monenfant.fr — Simuler le coût en crèche** (reste à charge mensuel parents, barème national Cnaf / PSU) : https://www.monenfant.fr/simuler-le-cout-en-creche — résultat **indicatif** ; lire les conditions sur la page (ex. plafond de ressources pris en charge par l’outil). Foyers **MSA** : le barème est le même principe national ; en cas de doute, **confirmer avec la MSA** ou le gestionnaire.
- **Simulateurs d’aides** (utiles **en parallèle** ou pour d’autres modes, ex. **CMG** micro-crèche hors PSU) — **pas** substituts au lien **monenfant** pour la **part familiale PSU** :
  - **Hub CAF — Estimer vos droits** : https://www.caf.fr/allocataires/mes-services-en-ligne/estimer-vos-droits
  - **Simulation « mode de garde » (CMG / PAJE)** : https://www.caf.fr/allocataires/aides-et-demarches/thematique-libre/votre-simulation-de-mode-de-garde
  - **Portail état** : https://www.mesdroitssociaux.gouv.fr/votre-simulateur/accueil
  - **MSA** : https://www.msa.fr/ — rubriques estimation / simulateurs **pour les aides** ; **insuffisants seuls** pour estimer la **part crèche PSU** (priorité **monenfant** ou barème / caisse).
- Si l’utilisateur **ne veut pas** ouvrir **monenfant** : tu peux faire toi-même une **mini-estimation indicative** du **€/mois parent** en t’appuyant sur le **guide / barème PSU (participation familiale)** publié par la **Cnaf** (PDF et pages **caf.fr**), **service-public.gouv.fr**, et cohérence avec l’outil **monenfant** si tu y accèdes — **cite toujours l’URL et l’intitulé** ; précise que c’est **indicatif** et que font foi **facture, avis d’échéance** ou **calcul du gestionnaire** ; l’utilisateur doit **valider explicitement** le montant avant `simulate.mjs`. Cette étape ne remplace **pas** `simulate.mjs` : elle sert **uniquement** à remplir `monthlyParticipationEur`.
- Si l’utilisateur **ne connaît pas** le montant : **explique** où le trouver (facture, espace allocataire, crèche). **Sans place encore** : pour un parcours **PSU**, oriente d’abord vers **monenfant.fr** (lien ci-dessus) ou **conseiller CAF / MSA / gestionnaire** ; à défaut, paragraphe **mini-estimation** ci-dessus. Tu peux lancer `simulate.mjs` **uniquement** si l’utilisateur **valide explicitement** le chiffre comme **hypothèse** (à rectifier à la première facture). Pour une **micro-crèche hors PSU**, le **prix salarié** = surtout **contrat / devis** structure (pas ce simulateur PSU) ; pour l’**aide CMG**, utiliser les **simulateurs d’aides** ci-dessus si besoin.
- **Rappel** : en crèche **PSU** (souvent publique ou inter-entreprises), la part employeur ne remplace **pas** ce barème côté parent — la question porte bien sur ce que **le salarié paie**, pas sur ce que l’entreprise finance pour la structure.

Voir **`INTAKE.md`** § Crèches.

## Analyse comparative et nounou à domicile

Lorsque l’utilisateur compare plusieurs modes et choisit **nounou à domicile**, demande **toujours** si l’emploi est **exclusivement** pour son foyer ou **partagé** avec un ou plusieurs **autres foyers** (co-emploi, répartition du coût convenue, ex. 50 % / 50 %).

- Si **partagé** : renseigne `brutInput.householdShareOfEmploymentCost` avec la **quote-part du coût d’emploi** supportée par ce foyer (nombre entre 0 et 1, ex. `0.5`). Saisis alors `hourlyGrossEur` et `hoursPerMonth` comme le **contrat / volume total** avant répartition (salaire brut total × heures totales), pour que le moteur applique la part au salaire et aux cotisations patronales du foyer.
- Fais **cohérents** les champs CMG `hourlyDeclaredGrossEur` et `heuresParMois` avec ce que **ce foyer déclare** à la CAF (souvent les heures et montants correspondant à sa quote-part, pas le contrat agrégé). Un avertissement moteur rappelle cet alignement lorsque la part est inférieure à 1.
- Alternative moteur : le mode `nounou_partagee` avec `simultaneousChildrenCount: 1` et `householdShareOfSalary` reprend une logique proche et ajoute une **majoration** si plusieurs enfants sont accueillis **simultanément** par la même garde ; pour un simple partage entre foyers sans majoration « simultanés », préfère `nounou_domicile` + `householdShareOfEmploymentCost`.
- **Autres coûts complémentaires** (congés, lissages fin de contrat, etc.) : remplis `brutInput.domicileComplementaryCosts` selon **`REFERENCE.md`** ; le **transport** suit la section **Transport de la nounou** ci-dessus. Présente **`monthlyBrutTaxCreditAssietteEur`** quand il diffère du brut total.

## Rappels

- Le moteur reste soumis aux **limites** listées dans **`REFERENCE.md`** (IR, crèche publique, annualisation CI, etc.).
- Sources officielles : dans le dépôt, `docs/SOURCES_OFFICIELLES.md` ; sinon résumer Service-Public / CAF / impots.gouv / URSSAF.
