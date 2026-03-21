# GARDE-034 — Coûts « cachés » garde à domicile (congés, maladie, fin de contrat)

| Field     | Value                                                                                                                                                                                                 |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Epic**  | E2 — Engine (paramètres E1 si barèmes ou taux versionnés)                                                                                                                                             |
| **Links** | **GARDE-006** (`computeBrutMonthlyCost`), **GARDE-010** (scénario agrégé, assiette crédit d’impôt), [`DR-04`](../research/DR-04-COUT-MODES.md), CCN particuliers employeurs / Service-Public / URSSAF |

## User / product value

Les comparaisons de modes incluent souvent une **nounou à domicile** avec seulement salaire horaire × heures + cotisations. En réalité, le foyer supporte aussi des coûts **récurrents ou épisodiques** : **congés payés** (maintien de rémunération / provisions), **absences pour maladie** (maintien, carence, complément IJSS selon cas), **indemnités et soldes en fin de contrat** (congés non pris, rupture, indemnité légale ou conventionnelle selon ancienneté et motif). Sans les modéliser (même de façon **optionnelle** et **prudente**), le **reste à charge** et la comparaison avec crèche / assmat sont **biaisés**.

## Scope

**In scope**

- Extension du **coût brut** pour les modes **emploi direct à domicile** concernés : au minimum `nounou_domicile` et, si pertinent, `nounou_partagee` (quote-part cohérente avec **GARDE-006** / champs existants).
- **Entrées utilisateur** et/ou **règles versionnées** pour des **lignes de coût additionnelles** explicites dans `BrutCostResult.lines`, par exemple (liste indicative — à figer après recherche) :
  - provision ou surcoût mensualisé lié aux **congés payés** ;
  - surcoût ou provision lié au **maintien de salaire** en **arrêt maladie** (ou saisie d’un forfait mensuel indicatif) ;
  - **fin de contrat** : soit montant **annualisé** (lissage sur 12 mois), soit saisie **ponctuelle** avec période d’amortissement en mois (à définir dans le spec d’implémentation).
- **Avertissements moteur** lorsque des hypothèses sont **simplificatrices** ou **non vérifiables** sans dossier (carence, convention collective, co-emploi).
- Mise à jour de la **chaîne scénario** (**GARDE-010**) : le **brut mensuel / annuel** utilisé pour CMG, crédit d’impôt et RAC doit **inclure ou exclure** ces postes de manière **documentée** ; si la **loi fiscale** ou la **CAF** n’intègre pas certains montants dans les mêmes assiettes que le salaire courant, le moteur doit **séparer les lignes** et appliquer le **routage** correct avec **warnings** (dépend de la recherche — voir ci-dessous).
- **Harness** : `REFERENCE.md`, éventuellement `SKILL.md` / instructions GPT, **exemple JSON** sous `docs/demo-scenarios/` si un cas représentatif est stable.
- **Tests** Vitest : au moins un scénario avec coûts additionnels activés, un sans (régression), et garde-fous sur les montants négatifs / bornes.

**Out of scope**

- Moteur de **paie complet** (bulletins, DSN, cumuls exacts jour par jour).
- **Simulation juridique** de licenciement / rupture (motifs, procédure).
- **Garde d’enfants à domicile** hors emploi salarié (auto-entrepreneur, etc.) si non couvert par les modes produit actuels.
- Décision **métier** sans **`[DEEP RESEARCH]`** : aucun coefficient « officiel » inventé.

## Acceptance criteria

1. Le fichier de story (ce document) et une **proposition de forme des données** (`BrutCostInput` ou sous-objet dédié) sont validés avant codage ; pas de breaking change JSON **non documenté** (suivre **GARDE-028** si version majeure).
2. Après implémentation : `computeBrutMonthlyCost` expose des **lignes** identifiables pour chaque poste « caché » activé (libellés FR stables ou clés + labels).
3. `computeScenarioSnapshot` propage ces montants dans le **brut agrégé** conformément aux règles retenues après recherche, avec **warnings** explicites si assiette CMG / crédit d’impôt **diffère** du salaire + charges courantes.
4. Toute règle chiffrée non sourcée primairement reste **`todoVerify`** dans le pack ou **saisie utilisateur** sans défaut « magique ».
5. Documentation harness à jour pour collecter ces champs lors d’une **analyse comparative** incluant nounou à domicile.
6. `bun run ci` vert ; commit message `GARDE-034`.

## Technical notes

- Réutiliser le pattern **lignes + trace** existant ; éviter de mélanger dans un seul montant opaque sans traçabilité.
- **Co-emploi / partage** : si `householdShareOfEmploymentCost` ou `householdShareOfSalary` s’applique, préciser dans le spec d’impl. si les coûts « cachés » sont saisis **au prorata foyer** ou **sur contrat total** puis multipliés — une seule convention par story.
- Envisager un **mode de saisie** « forfait mensuel indicatif » (€/mois) en plus d’un mode « paramètres détaillés » pour limiter la charge cognitive côté harness.

## Deep research

**Livrable** : [`DR-06-EMPLOI-DOMICILE-COUTS-COMPLEMENTAIRES.md`](../research/DR-06-EMPLOI-DOMICILE-COUTS-COMPLEMENTAIRES.md) (prompt : [`DR-06-EMPLOI-DOMICILE-COUTS-COMPLEMENTAIRES-PROMPT.md`](../research/prompts/DR-06-EMPLOI-DOMICILE-COUTS-COMPLEMENTAIRES-PROMPT.md)).

- Livrable : tableau **poste de coût** × **obligatoire / usuel** × **assiette fiscale / aide** × **incertitudes**.

## Test plan

- Nounou à domicile : baseline inchangée lorsque les nouveaux champs sont **absents** ou à zéro.
- Avec provision CP / forfait maladie / lissage fin de contrat : total brut et RAC cohérents (signe, arrondis 2 décimales).
- Scénario partagé (quote-part) : pas de double comptage ni d’oubli de quote-part sur les nouvelles lignes.
- Warning émis lorsque l’implémentation **n’applique pas** un poste à l’assiette crédit d’impôt (si la recherche l’exige).

## Risks & mitigations

| Risk                                    | Mitigation                                                                   |
| --------------------------------------- | ---------------------------------------------------------------------------- |
| Erreur d’assiette fiscale ou CMG        | Recherche documentée ; lignes séparées ; warnings ; pas de défaut silencieux |
| Complexité excessive pour l’utilisateur | Mode forfait mensuel + doc harness « quand affiner »                         |
| Variabilité conventionnelle             | Paramètres pack ou saisie ; `todoVerify` sur tout barème non national        |

## Done checklist

- [x] Story spec (this file)
- [x] Deep research **DR-06** dans le dépôt
- [x] Implémentation moteur (`domicileComplementaryCosts`, assiette CI, snapshot) + harness + démo `nounou-domicile-complementary-dr06-2026.json`
- [x] Tests + `bun run ci`
- [x] Commit `GARDE-034`
- [x] Ligne dans le [Story completion log](../SPRINT_PLAN.md#story-completion-log) de `SPRINT_PLAN.md`

## Sprint plan

Après clôture : ligne dans [`SPRINT_PLAN.md`](../SPRINT_PLAN.md) (backlog + completion log).
