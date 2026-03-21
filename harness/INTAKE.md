# Playbook d’entretien — collecte `ScenarioInput`

Guide pour le **harness** (skill Claude, Custom GPT, etc.) : poser les questions **dans cet ordre** réduit les allers-retours avec `POST /v1/calculate` (réponses **422** si champs manquants — voir schéma Zod / JSON Schema).

## 0. Préambule

- Année visée : en général **`household.taxYear`** = `2026` (aligné sur le pack `config/rules.fr-2026.json`).
- Un calcul = **un mode de garde** ; pour comparer plusieurs modes, relancer avec un autre `brutInput.mode`.
- **TMI / IR** : optionnel via **`incomeTax`** (revenu net imposable ou brut + parts, ou seulement revenu après IR pour le disponible) — voir **DR-07** ; ne pas confondre avec le **PAS** sur fiche de paie.
- **crèche publique / inter-entreprises** → CMG souvent `unsupported` (voir `limitationHints` dans la réponse).

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

### `nounou_partagee`

1. Horaire brut, heures / mois
2. **Nombre d’enfants** accueillis en même temps (`simultaneousChildrenCount` ≥ 1)
3. **Quote-part salaire** de ce foyer (`householdShareOfSalary`, 0–1)
4. Part cotisations patronales
5. **Transport** : même logique que `nounou_domicile` (question obligatoire, montants **au niveau de ce foyer**).
6. Option : autres postes dans `domicileComplementaryCosts`.

### `assistante_maternelle` / `mam`

1. Horaire brut, heures / mois
2. **Jours de garde** / mois (`careDaysPerMonth`)
3. **Indemnité d’entretien** (€ / jour)
4. Part cotisations patronales
5. `mam` uniquement : **participation structure** mensuelle (€)

### Crèches (`creche_*`)

1. **Participation mensuelle** facturée au foyer (`monthlyParticipationEur`)

## 3. Bloc `cmg` (sans champ `mode` — repris de `brutInput`)

1. **Cumuls** PreParE / AAH (`cmg.cumul` : booléens optionnels).
2. **Emploi direct** (nounou / assmat / MAM) : revenu mensuel de référence, rang d’effort, salaire horaire brut déclaré, heures / mois (voir démos).
3. **Micro-crèche** : revenus N-2, nb enfants à charge, tarif horaire réel, etc. (voir `docs/demo-scenarios/micro-creche-bas-revenus-2026.json`).

## 4. Options fréquentes

- **`baselineDisposableIncomeMonthlyEur`** : pour afficher un « disponible » après RAC (sinon `null`). Avec **`incomeTax`** (assiette RNI ou brut), le moteur peut soustraire l’IR estimé / 12 — vérifier qu’il n’y a pas **double comptage** avec un revenu déjà net de PAS (`monthlyResourcesAlreadyAccountForIncomeTax`).
- **`incomeTax.annualHouseholdIncomeAfterIncomeTaxEur`** : si le foyer connaît son revenu **après IR** annuel, prioritaire pour le disponible (= ce montant ÷ 12 − RAC mensuel).
- **`taxCredit`** : précisions crédit d’impôt (garde hors domicile, CESU préfinancé, etc.).
- **Soutien employeur** : `declaredEmployerChildcareSupportAnnualEur` + `referenceEmployerChildcareSupportAnnualEur` pour le delta.

## 5. Gabarits

Copier-coller depuis `docs/demo-scenarios/*.json` ou `examples/` dans le ZIP skill, puis ajuster.

## 6. Après le calcul

Présenter **snapshot**, **warnings**, **limitationHints**, **uncertainty**, et **`meta`** (versions moteur / pack). Renvoyer vers `docs/SOURCES_OFFICIELLES.md` pour toute décision personnelle.
