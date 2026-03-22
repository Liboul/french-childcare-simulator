# Playbook d’entretien — collecte `ScenarioInput`

Guide pour le **harness** (skill Agent Skills / ZIP, Custom GPT, etc.) : poser les questions **dans cet ordre** réduit les allers-retours avec le validateur (`simulate.mjs` → `validation_failed` + `issues[]` si champs manquants — voir schéma Zod / JSON Schema).

## 0. Préambule

- Année visée : en général **`household.taxYear`** = `2026` (aligné sur le pack `config/rules.fr-2026.json`).
- Un calcul = **un mode de garde** ; pour comparer plusieurs modes, relancer avec un autre `brutInput.mode`.
- **TMI / IR** : optionnel via **`incomeTax`** (revenu net imposable ou brut + parts, ou seulement revenu après IR pour le disponible) — voir **DR-07** ; ne pas confondre avec le **PAS** sur fiche de paie.
- **crèche publique / inter-entreprises** → CMG souvent `unsupported` (voir `limitationHints` dans la réponse).
- **Tout mode de garde** → question employeur **CESU / titres préfinancés** (ou assimilés) : **`INTAKE.md`** § 3 bis **partie A ou B** avant `simulate.mjs`.

## 1. Mode de garde

Demander le mode parmi :

- `nounou_domicile`, `nounou_partagee`, `assistante_maternelle`, `mam`
- `creche_publique`, `creche_privee`, `creche_inter_entreprises`

## 2. Champs `brutInput` (selon le mode)

### `nounou_domicile`

1. Salaire **horaire brut** déclaré (€)
2. **Heures par mois**
3. **Part cotisations patronales** sur le brut (0–1, ex. `0,42`)
4. Option : **quote-part du contrat** supportée par ce foyer (`householdShareOfEmploymentCost`, 0–1) si nounou partagée entre foyers.
5. **Transport de la salariée** (à poser **systématiquement**) : rembourse-t-on les frais (ex. **Navigo** plein, **demi-tarif**, forfait **zones limitées**) ? Si non → `domicileComplementaryCosts.fraisTransportBase`: `"non"`. Si oui → consulter le **tarif officiel** (https://www.iledefrance-mobilites.fr/titres-et-tarifs/detail/forfait-navigo-mois , https://www.navigo.fr/ ), puis `fraisTransportMensuelEur` (€/mois à la charge du foyer) + `fraisTransportBase` (`navigo_mois_plein` \| `navigo_demi_tarif` \| `navigo_zones_limitees` \| `autre`).
6. Option : **autres coûts complémentaires** DR-06 (`domicileComplementaryCosts` : provision CP, lissages, etc.) — voir `REFERENCE.md` et `docs/research/DR-06-EMPLOI-DOMICILE-COUTS-COMPLEMENTAIRES.md`.
7. **Chèques CESU préfinancés employeur** : suivre **§ 3 bis partie A** (questions **obligatoires** avant `simulate.mjs`, au même titre que le transport).

### `nounou_partagee`

1. Horaire brut, heures / mois
2. **Nombre d’enfants** accueillis en même temps (`simultaneousChildrenCount` ≥ 1)
3. **Quote-part salaire** de ce foyer (`householdShareOfSalary`, 0–1)
4. Part cotisations patronales
5. **Transport** : même logique que `nounou_domicile` (question obligatoire, montants **au niveau de ce foyer**).
6. Option : autres postes dans `domicileComplementaryCosts`.
7. **CESU employeur** : **§ 3 bis partie A**.

### `assistante_maternelle` / `mam`

1. Horaire brut, heures / mois
2. **Jours de garde** / mois (`careDaysPerMonth`)
3. **Indemnité d’entretien** (€ / jour)
4. Part cotisations patronales
5. `mam` uniquement : **participation structure** mensuelle (€)
6. **CESU / titres employeur pour cette garde** (hors domicile) : **§ 3 bis partie B** — obligatoire avant `simulate.mjs`.

### Crèches (`creche_*`)

**À poser systématiquement** (comme le transport pour la nounou) — sans ce montant, le JSON est **invalide** ou le résultat est **sans sens** :

1. **Participation mensuelle payée par le parent** (`monthlyParticipationEur`, en €) : demander **explicitement** « combien payez-vous **vous** par mois pour la place ? » (facture, prélèvement, avis d’échéance, espace CAF, attestation de la crèche). **Ne pas** supposer 0 € ni un montant indicatif **sans** que l’utilisateur l’ait dit ou validé comme hypothèse. Le moteur **ne calcule pas** le barème PSU : tu ne **fabriques** pas ce chiffre en silence.
   - **Prix payé par le parent en crèche PSU** (participation familiale) : **priorité** au simulateur **reste à charge** — https://www.monenfant.fr/simuler-le-cout-en-creche (**monenfant.fr**). Ce n’est **pas** la même chose que les simulateurs **d’aides** sur caf.fr (CMG, etc.).
   - **Aides (CMG, autres)** si besoin : hub CAF **Estimer vos droits** — https://www.caf.fr/allocataires/mes-services-en-ligne/estimer-vos-droits ; simulation **mode de garde** — https://www.caf.fr/allocataires/aides-et-demarches/thematique-libre/votre-simulation-de-mode-de-garde ; **mesdroitssociaux.gouv.fr** — https://www.mesdroitssociaux.gouv.fr/votre-simulateur/accueil ; **MSA** — https://www.msa.fr/.
   - **Utilisateur qui ne veut pas ouvrir monenfant** : **mini-estimation** du **€/mois parent** via **guide / barème PSU** (Cnaf, caf.fr, service-public) — **citer les sources**, **indicatif**, **« oui » explicite**, puis `simulate.mjs`. Détail : **`SKILL.md`** § participation crèche.
   - **Pas encore de place** : crèche **PSU** → **monenfant** ou conseiller **CAF / MSA / gestionnaire** ; micro-crèche **hors PSU** → **devis** (prix = contrat ; **aide** = simulateurs CAF si pertinent).
   - **`creche_publique`** / **`creche_inter_entreprises`** (souvent **PSU**) : la part facturée au parent suit en principe le **barème national** (comme une autre EAJE conventionnée) ; la prise en charge **employeur** finance le reliquat pour la structure et **ne remplace pas** ce que le parent doit payer au titre de la participation familiale.
   - **`creche_privee`** : demander aussi si la structure est **PSU** ou **micro-crèche / PAJE hors PSU** (tarif plus libre ; CMG structure possible si éligible — voir démo micro-crèche et pack CMG).
   - Contexte détaillé (hors archive skill ZIP) : `docs/research/DR-08-PSU-CRECHE-PART-FAMILLE.md` dans le dépôt.

2. **Aide employeur type CESU préfinancé (ou assimilée) pour cette place** : **§ 3 bis partie B** — obligatoire avant `simulate.mjs` (après le montant de participation ci-dessus).

## 3. Bloc `cmg` (sans champ `mode` — repris de `brutInput`)

1. **Cumuls** PreParE / AAH (`cmg.cumul` : booléens optionnels).
2. **Emploi direct** (nounou / assmat / MAM) : revenu mensuel de référence, rang d’effort, salaire horaire brut déclaré, heures / mois (voir démos).
3. **Micro-crèche** : revenus N-2, nb enfants à charge, tarif horaire réel, etc. (voir `docs/demo-scenarios/micro-creche-bas-revenus-2026.json`).

## 3 bis. CESU préfinancé employeur et aides assimilées (assiette crédit d’impôt)

Le moteur **ne route pas** ces montants de la même façon selon le mode : voir `taxCreditKind` dans le snapshot (`emploi_domicile` vs `garde_hors_domicile`, `REFERENCE.md`).

**Quand poser** — **avant** le **premier** `simulate.mjs` pour **chaque** JSON (un mode par fichier). En **comparaison** de plusieurs modes, **chaque** scénario doit avoir reçu la **partie A ou B** ci-dessous, même si la réponse est « non ».

### Partie A — `nounou_domicile`, `nounou_partagee` (crédit **emploi à domicile**)

Champ : **`taxCredit.prefundedCesuAnnualEur`**.

1. **Question obligatoire (ne pas attendre que l’utilisateur en parle)** : l’employeur du parent (ou des deux parents si pertinent) propose-t-il des **chèques CESU préfinancés** (prise en charge employeur, totale ou partielle) ?
   - **Non** : laisser `prefundedCesuAnnualEur` absent ou à `0` selon le défaut attendu par le validateur.
   - **Oui** : saisir le **montant annuel** d’aide employeur en CESU préfinancé **pertinent pour cette garde** dans `prefundedCesuAnnualEur`.
   - **Ne sait pas** : ne pas supposer « non » ; estimation / fourchette ou hypothèse **explicitement validée**.
   - **Plafond légal (aide employeur / CESU préfinancé, pas le crédit d’impôt)** : documenté dans le **rule pack** — règle **`cesu-prefinance-plafond-aide-financiere-employeur`**. Avec **`rules.fr-2026`** : **2540 € / an / bénéficiaire** depuis 2025-01-01. **Ne pas** aller chercher ce chiffre sur internet : utiliser **`REFERENCE.md`** § plafond CESU + **`meta.rulePackVersion`** après `simulate.mjs` ; si la saisie dépasse le pack → **`warnings`** `cesu_prefunded_exceeds_employer_aid_annual_cap`.

2. **Si oui — question obligatoire tout de suite après** : ces CESU sont-ils **en complément** du **brut de l’emploi à domicile** tel que sur le **contrat / déclaration URSSAF** (enveloppe employeur **plus large**), ou en **substitution** (**conversion** / **échange** à **coût employeur équivalent**, sans « bonus » d’enveloppe) ?
   - **En plus du brut déclaré pour la garde** : `hourlyGrossEur` et `hoursPerMonth` = salaire brut **tel quel** ; `prefundedCesuAnnualEur` = CESU employeur pour financer (en partie) cette garde — **sans** confondre avec `incomeTax.annualGrossSalaryEur` (brut du **poste salarié** du parent).
   - **Substitution / même coût employeur** : clarifier ce que couvre le **brut nounou** saisi ; **pas de double comptage** entre brut et CESU. Si besoin : **qui paie quoi** (virement vs titre) et **montants annuels** ; réaligner `hourlyGrossEur` / `prefundedCesuAnnualEur`, puis relancer `simulate.mjs`.

### Partie B — `assistante_maternelle`, `mam`, `creche_*` (crédit **garde hors domicile**)

Champ : **`taxCredit.outsideHomeAnnualEmployerAidDeductibleEur`** (aide employeur **annuelle** déduite de l’assiette du crédit « garde hors du domicile » : titres / CESU employeur **affectés à cette garde**, ou autre aide assimilée selon la **déclaration utilisateur**). Le moteur **n’utilise pas** `prefundedCesuAnnualEur` pour ces modes.

1. **Question obligatoire** : l’employeur propose-t-il des **chèques CESU (ou titres) préfinancés**, ou une **autre aide employeur déductible**, pour financer **cette** garde (factures assmat / MAM / crèche) ?
   - **Non** : `outsideHomeAnnualEmployerAidDeductibleEur` absent ou `0`.
   - **Oui** : saisir le **montant annuel** que l’utilisateur affecte à cette aide pour l’assiette CI dans `outsideHomeAnnualEmployerAidDeductibleEur` (en cas de doute sur le traitement fiscal, renvoyer vers règles officielles / professionnel).
   - **Ne sait pas** : idem partie A.

2. **Si oui — question obligatoire** : l’aide est-elle **en plus** des **dépenses payées** déjà reflétées dans la saisie (**participation crèche** `monthlyParticipationEur` ; coût assmat / MAM issu du `brutInput`), ou en **substitution** (réduit ce que vous payez **net**, **même coût employeur**) ? Objectif : **pas de double comptage** entre facture / participation et montant déductible.

**Interdit** : lancer `simulate.mjs` **sans** avoir posé la question 1 de la **partie applicable** (A ou B) ; si l’utilisateur **mentionne** des CESU **sans** répondre à la question 2, **ne pas** deviner — poser la question 2 **immédiatement**. **Interdit** d’utiliser `prefundedCesuAnnualEur` pour un mode **hors domicile** à la place de `outsideHomeAnnualEmployerAidDeductibleEur`.

## 4. Options fréquentes

- **`baselineDisposableIncomeMonthlyEur`** : pour afficher un « disponible » après RAC (sinon `null`). Avec **`incomeTax`** (assiette RNI ou brut), le moteur peut soustraire l’IR estimé / 12 — vérifier qu’il n’y a pas **double comptage** avec un revenu déjà net de PAS (`monthlyResourcesAlreadyAccountForIncomeTax`).
- **`incomeTax.annualHouseholdIncomeAfterIncomeTaxEur`** : si le foyer connaît son revenu **après IR** annuel, prioritaire pour le disponible (= ce montant ÷ 12 − RAC mensuel).
- **`incomeTax.annualNetSalaryFromPayslipsEur`** (optionnel) : total annuel des **salaires nets** (bulletins, après cotisations, **avant** IR) — pour le **reporting** dans le `snapshot` ; ne pilote pas le barème IR. À distinguer du revenu après IR ci-dessus.
- **`taxCredit`** : **`prefundedCesuAnnualEur`** (partie A) et **`outsideHomeAnnualEmployerAidDeductibleEur`** (partie B) — parcours **§ 3 bis** pour **chaque** mode ; ne pas omettre les questions employeur.
- **Soutien employeur** : `declaredEmployerChildcareSupportAnnualEur` + `referenceEmployerChildcareSupportAnnualEur` pour le delta.

## 5. Gabarits

Copier-coller depuis `docs/demo-scenarios/*.json` ou `examples/` dans le ZIP skill, puis ajuster.

## 6. Après le calcul

Présenter **snapshot**, **warnings**, **limitationHints**, **uncertainty**, et **`meta`** (versions moteur / pack). Renvoyer vers `docs/SOURCES_OFFICIELLES.md` pour toute décision personnelle.
