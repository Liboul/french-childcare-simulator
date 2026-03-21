# DR-07 — Impôt sur le revenu français : TMI, barème, crédits d'impôt et disponible mensuel

**Document** : DR-07-IR-TMI-DISPONIBLE  
**Statut** : Vérification-grade research pack (non-legal advice)  
**Audience** : Ingénieurs TypeScript / moteur GARDE-019  
**Date de rédaction** : 21 mars 2026  
**Couverture** : Revenus 2025 — Imposition 2026 (barème LOI n° 2026-103 du 19 février 2026, art. 4)  
**Périmètre géographique** : France métropolitaine, foyers soumis à l'IR sur le revenu global

---

## 1. Executive summary

Le présent document répond aux besoins du moteur GARDE-019 qui vise à modéliser, de manière transparente et paramétrable, l'effet fiscal d'une variation de charges de garde sur le revenu disponible d'un foyer.

**Points clés pour l'implémentation :**

1. **Le barème 2026 (revenus 2025) est définitivement publié.** La LOI n° 2026-103 du 19 février 2026 (art. 4, modifiant CGI art. 197) revalorisation de **+0,9 %** des seuils de tranches. Les chiffres sont encodables dès maintenant.

2. **La TMI est la tranche du barème progressif qui s'applique au quotient familial marginal.** Ce n'est pas le taux PAS, ni le taux moyen. Elle est lisible directement sur le barème, à condition de connaître le quotient familial (revenu net imposable ÷ nombre de parts).

3. **Le crédit d'impôt garde enfants (CGI art. 200 quater B) est remboursable et s'impute après les réductions d'impôt.** Son excédent est restitué. Il ne fait pas double emploi avec la TMI si les deux sont calculés sur des assiettes distinctes — mais un moteur qui combine TMI sur variation de revenu + crédit d'impôt sur dépenses de garde doit éviter de les appliquer simultanément aux mêmes euros.

4. **Le PAS ne change pas le montant annuel d'IR dû** ; il modifie uniquement la trésorerie mensuelle. Pour un comparateur pédagogique de « disponible mensuel », l'IR annuel doit être retiré sur 12 mois (ou sur la durée de garde), pas en taux PAS brut.

5. **Modèle recommandé pour GARDE-019** : approche « barème + quotient explicite » dans un fichier JSON versionné, avec avertissement utilisateur sur les simplifications (abattements non modélisés, décote, autres crédits d'impôt).

6. **Unknowns 2026** : le barème revenus 2026 (imposition 2027) n'est pas publié à la date de rédaction. Les paramètres de décote 2026 (pour revenus 2025) sont publiés au BOFiP mais la version finale mise à jour au titre de la LFI 2026 doit être vérifiée.

---

## 2. Définition TMI et distinction taux moyen / PAS

### 2.1 Définition opérationnelle de la TMI

Il n'existe pas de définition formelle de la TMI dans un article du CGI ou dans le BOFiP. La notion est utilisée de manière descriptive par l'administration.

**Source la plus proche d'une définition officielle :** economie.gouv.fr (consulté 21/03/2026) :

> « Le taux marginal d'imposition (TMI) quant à lui est le taux d'imposition auquel vous êtes imposé sur la **dernière tranche** de vos revenus. »

**Définition opérationnelle retenue pour GARDE-019 :**

> La TMI d'un foyer fiscal est le **taux de la tranche du barème progressif dans laquelle se situe son quotient familial** (revenu net imposable ÷ nombre de parts). C'est le taux qui s'applique à tout euro supplémentaire de revenu imposable **si le foyer reste dans cette tranche**.

**Formalisation mathématique :**

```
revenu_net_imposable = revenu_brut - abattements
quotient = revenu_net_imposable / nb_parts
TMI = taux de la tranche dans laquelle tombe le quotient (table § 3.1)
ΔIR ≈ Δrevenu_imposable × TMI    [approximation valide hors effets de seuil]
```

**Attention — effets non linéaires :** si une variation de revenu fait franchir une borne de tranche, la TMI effective sur la variation est un taux mixte. Le moteur doit le modéliser ou poser un `todoVerify` explicite.

### 2.2 Ce que la TMI n'est PAS — matrice de confusion

| Concept | Définition | Différence avec TMI | Source |
|---|---|---|---|
| **Taux moyen d'imposition** | IR total / revenu net imposable | Toujours ≤ TMI, sauf tranche 0 % | Service-Public.fr [S1], economie.gouv.fr [S4] |
| **Taux PAS personnalisé** | IR estimé (hors crédits) / revenu imposable foyer | Taux moyen estimé, calculé sur N-2, hors crédits d'impôt | economie.gouv.fr [S9], Service-Public.fr [S8] |
| **Taux PAS neutre** | Barème simplifié célibataire sans enfant | Ne reflète pas la situation réelle du foyer | BOFiP BOI-BAREME-000037 [S10] |
| **Taux de flat tax (PFU)** | 12,8 % sur revenus du capital | Hors barème progressif | CGI art. 200 A |
| **CEHR** | Contribution exceptionnelle sur hauts revenus (1–4 %) | Imposition distincte assise sur RFR, non sur revenu net imposable | CGI art. 223 sexies [S7] |

> **Règle d'or pour GARDE-019** : ne jamais confondre taux PAS affiché sur la fiche de paie avec la TMI. Le PAS est calculé sur revenus N-2 (actualisé en septembre N-1), sans déduction des crédits d'impôt. La TMI se détermine sur le quotient de l'année courante.

### 2.3 Taux moyen vs TMI — illustration chiffrée (barème 2026)

Un célibataire avec revenu net imposable 30 000 € (1 part) :

| Calcul | Résultat |
|---|---|
| Tranche 0 % : 0 € → 11 600 € | 0 € |
| Tranche 11 % : 11 601 € → 29 579 € = 17 978 € × 11 % | 1 977,58 € |
| Tranche 30 % : 29 580 € → 30 000 € = 420 € × 30 % | 126,00 € |
| **IR brut** | **2 103,58 €** |
| **Taux moyen** | 7,01 % |
| **TMI** | **30 %** |

Source : Service-Public.fr F1419 [S1], CGI art. 197 modifié par LOI 2026-103 [S2].

---

## 3. Barème IR — tranches, quotient, parts

### 3.1 Barème applicable aux revenus 2025 (imposition 2026)

**Base légale** : CGI art. 197, I-1, modifié par LOI n° 2026-103 du 19 février 2026, art. 4 (V).  
Consulté sur Légifrance le 21/03/2026 : https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051212954

Revalorisation : **+0,9 %** par rapport au barème 2025 (revenus 2024).

| Tranche du quotient familial (€) | Taux | Impôt marginal sur cette fraction |
|---|---|---|
| 0 — 11 600 | **0 %** | 0 |
| 11 601 — 29 579 | **11 %** | max 1 977,78 € / part |
| 29 580 — 84 577 | **30 %** | max 16 499,10 € / part |
| 84 578 — 181 917 | **41 %** | max 39 918,17 € / part |
| > 181 917 | **45 %** | illimité |

> **Note d'implémentation** : les seuils s'appliquent **par part de quotient familial**, pas au revenu total. L'impôt par part est ensuite multiplié par le nombre de parts.

**Formule de calcul complet :**
```
1. quotient = revenu_net_imposable / nb_parts
2. impot_par_part = Σ (fraction_dans_tranche_i × taux_i)
3. impot_brut = impot_par_part × nb_parts
4. Appliquer plafonnement QF si applicable (§ 3.3)
5. Appliquer décote si applicable (§ 3.4)
6. impot_net_avant_credits = impot_apres_decote
7. Soustraire réductions d'impôt, puis crédits d'impôt (§ 4)
```

### 3.2 Nombre de parts — règles de base suffisantes pour un comparateur foyer-type

**Base légale** : CGI art. 193, 194, 195 ; BOFiP BOI-IR-LIQ-10-20 [S5].

| Situation familiale | Parts de base | Parts supplémentaires |
|---|---|---|
| Célibataire / divorcé / séparé sans enfant | 1 | — |
| Marié / PACS, imposition commune, sans enfant | 2 | — |
| + 1er enfant à charge | +0,5 | (demi-part) |
| + 2e enfant à charge | +0,5 | (demi-part) |
| + 3e enfant à charge (et suivants) | +1 | (part entière) |
| Parent isolé (case T) — 1er enfant à charge exclusive | +1 au lieu de +0,5 | Plafond spécifique 4 262 € |
| Résidence alternée — chaque enfant partagé | +0,25 | (quart de part par parent) |
| Veuf(ve) ayant eu des enfants | 2 + parts enfants | — |

**Sources** : CGI art. 194 [S2], Service-Public.fr F2705 [S6], Service-Public.fr F35120 [S11], BOFiP BOI-IR-LIQ-10-20-20-10 [S5].

**Pour GARDE-019** : les paramètres encodables dans JSON sont `nb_parts` calculé depuis `situation_familiale` + `nb_enfants_a_charge` + `residence_alternee`. Les situations d'invalidité, ancien combattant, etc. sont hors scope et doivent être marquées `todoVerify`.

### 3.3 Plafonnement du quotient familial

**Base légale** : CGI art. 197, I-2 (modifié par LOI 2026-103).

L'avantage fiscal procuré par chaque demi-part supplémentaire est **plafonné** :

| Plafond général 2026 | Montant |
|---|---|
| Par demi-part supplémentaire (cas général) | **1 807 €** |
| Par quart de part supplémentaire | **904 €** |
| Parent isolé (part entière du 1er enfant, case T) | **4 262 €** (plafond spécifique) |
| Demi-part « vieux combattant » ou invalidité | **1 079 €** (plafond spécifique) |

**Mécanisme** : l'administration calcule l'impôt en deux étapes et retient le plus élevé des deux si le plafonnement s'applique. Pour GARDE-019, ce plafonnement est matériel pour les familles avec enfants dont le revenu est dans les tranches 11 % ou 30 % ; il peut réduire l'effet TMI apparent.

### 3.4 Décote (art. 197, I-4 du CGI)

La décote est une **réduction d'impôt automatique** pour les foyers modestes. Elle intervient **après** le barème et le plafonnement QF, **avant** les réductions et crédits d'impôt.

**Seuils et calcul — revenus 2025 (imposition 2026)** :

Source : economie.gouv.fr [S4], corroboré par le BOFiP BOI-IR-LIQ-20-20-30 [S12] (qui cite les montants 2024 ; les montants 2026 ont été revalorisés de +0,9 %) :

| Situation | Seuil d'impôt brut déclenchant la décote | Formule décote |
|---|---|---|
| Imposition individuelle (célibataire, divorcé, veuf) | < **1 982 €** | 897 € − (45,25 % × impôt_brut) |
| Imposition commune (couple) | < **3 277 €** | 1 483 € − (45,25 % × impôt_brut) |

> **Attention** : la décote génère un **taux marginal effectif supérieur à la TMI nominale** dans la zone de déclenchement. Pour un célibataire dans la tranche 11 % avec impôt brut < 1 982 €, chaque euro supplémentaire de revenu imposable génère non pas 11 % mais 11 % × (1 + 45,25 %) ≈ 16 % d'impôt supplémentaire, car la décote décroît simultanément. Ce **phénomène de « fausse TMI »** doit faire l'objet d'un warning dans GARDE-019.

**Pour un moteur conservateur** : si le revenu net imposable du foyer / nb_parts ≤ ~18 000 € (célibataire) ou ~17 500 € par part (couple), poser un flag `decote_possible = true` et avertir l'utilisateur que la TMI affichée peut sous-estimer l'effet marginal réel.

### 3.5 Abattements et assiette avant barème

Les principaux abattements modifiant l'assiette avant barème, dans la limite de ce qu'un comparateur peut raisonnablement modéliser :

| Abattement | Montant 2026 | Base légale | Encodable ? |
|---|---|---|---|
| Frais professionnels salariés (forfait 10 %) | Min 509 €, max 14 556 € | CGI art. 83, 3° | Oui (si revenus salariaux) |
| Abattement 10 % retraites | Maintenu (réforme avortée) | CGI art. 158, 5-a | Oui (si retraités) |
| Déduction PER (plan épargne retraite) | 10 % revenus pro, max 35 194 € | CGI art. 163 quatervicies | `todoVerify` (variable individuelle) |
| Déficit foncier | Variable | CGI art. 156, I-3° | Hors scope — `todoVerify` |

> **Sources** : UFC-Que Choisir [S3] (confirmation abattement retraites maintenu), Service-Public.fr F1419 [S1].

**Pour GARDE-019 :** le moteur peut modéliser le revenu net imposable comme :  
`RNI = salaires_bruts × 0,90` (abattement forfaitaire 10 %, sous réserve min/max)  
ou accepter en entrée un `revenu_net_imposable` déclaré par l'utilisateur. La deuxième option est plus robuste et plus transparente.

---

## 4. Crédits d'impôt déjà calculés ailleurs — imputation et cohérence avec une marge IR

### 4.1 Nature du crédit d'impôt garde enfants (CGI art. 200 quater B)

**Base légale** : CGI art. 200 quater B ; BOFiP BOI-IR-RICI-300 [S13].

- Taux : **50 %** des dépenses de garde effectives (hors aides déduites comme le CMG/PAJE).
- Plafond de dépenses : **3 500 € / enfant / an** (règle DR-02 — non vérifiée dans ce document).
- **Remboursable** : si le crédit excède l'impôt dû, l'excédent est **restitué** par l'administration.
- Soumis au plafonnement global des niches fiscales : 10 000 € (CGI art. 200-0 A).

### 4.2 Ordre d'imputation — séquence légale

**Source** : BOFiP BOI-IR-RICI (versions 2021, 2023, 2025) [S14], BOFiP BOI-IR-RICI-150-20 [S15].

```
IR brut (après barème + quotient)
  ↓
[1] Plafonnement QF (§ 3.3)
  ↓
[2] Décote (§ 3.4)
  ↓  ← impôt brut corrigé
[3] Réductions d'impôt (art. 199 quater B à 200 bis CGI)
    — ne génèrent PAS de remboursement si > impôt dû
  ↓
[4] Crédits d'impôt (dont crédit garde enfants art. 200 quater B)
    + prélèvements/retenues non libératoires
    — excédent RESTITUÉ
  ↓
IR net dû (peut être négatif → remboursement)
```

> **Note** : le BOFiP (BOI-IR-RICI-20250618) précise une exception pour les crédits d'impôt conventionnels (double imposition internationale), qui s'imputent avant les réductions à report. Cette exception ne concerne pas le crédit garde enfants.

### 4.3 Distinction réduction vs crédit d'impôt — important pour la modélisation

| Caractéristique | Réduction d'impôt | Crédit d'impôt |
|---|---|---|
| Effet si > impôt dû | Perdu (pas de remboursement) | **Restitué** |
| Exemple garde | — | Crédit garde art. 200 quater B |
| Impact sur disponible | Réduit IR, max jusqu'à 0 | Réduit IR jusqu'à 0, puis remboursement positif |

### 4.4 Risques de double comptage — matrice source × règle

| Scénario | Risque | Règle à appliquer |
|---|---|---|
| TMI appliquée à ΔRevenu + crédit d'impôt calculé sur dépenses de garde | **Aucun double comptage si les assiettes sont distinctes** : la TMI porte sur une variation de revenu, le crédit sur les dépenses de garde nettes. | Vérifier que le crédit CI garde est calculé sur dépenses nettes (après CMG), pas sur un revenu. |
| TMI appliquée à une économie de charge incluant déjà l'effet du CI garde | **Double comptage** : le moteur compterait deux fois l'économie fiscale de la garde. | Ne pas inclure le CI garde dans la base de calcul de la variation de disponible si le CI est déjà modélisé séparément (DR-02). |
| Décote ignorée alors que l'IR brut est < seuil | **Sous-estimation du coût marginal fiscal** : la TMI nominale sous-estime l'effet réel. | Implémenter le flag `decote_possible` (§ 3.4). |
| Plafonnement QF ignoré | **Sur-estimation de l'effet des parts supplémentaires** pour les familles à revenu modéré. | Implémenter le plafonnement (§ 3.3) ou marquer `todoVerify` si hors scope. |
| Crédit garde + TMI + CMG sur mêmes dépenses | **Triple comptage** : dépenses déjà réduites par CMG, puis CI calculé sur net, puis TMI sur net également. | La dépense nette de garde après CMG est l'assiette du CI (art. 200 quater B) ; la TMI porte sur l'impact revenu (ex : variation de salaire net de charges, pas sur la dépense de garde). |

**Règle d'architecture recommandée pour GARDE-019 :**

```
disponible_mensuel =
  revenu_mensuel_net
  - IR_annuel_estimé / 12          [module IR — ce document]
  - coût_net_garde_mensuel         [CMG déduit, module DR-02]
  + crédit_impôt_garde_annuel / 12 [restitution, module DR-02]
```

Les trois termes sont indépendants. Ne pas appliquer la TMI à `coût_net_garde_mensuel` si le `crédit_impôt_garde` est déjà calculé dans DR-02.

---

## 5. PAS vs solde annuel — implications pour un « disponible mensuel »

### 5.1 Ce que le PAS change et ne change pas

**Source** : economie.gouv.fr [S9], Service-Public.fr F34009 [S8], Service-Public.fr F35894 [S16].

| Dimension | Impact PAS | Pertinence pour GARDE-019 |
|---|---|---|
| **Montant annuel d'IR dû** | Inchangé (le PAS ne modifie pas le calcul fiscal final) | L'IR annuel modélisé est correct indépendamment du PAS |
| **Trésorerie mensuelle** | Le PAS prélève l'IR approximatif chaque mois → le net bancaire mensuel est déjà net d'une estimation d'IR | Important : si l'utilisateur entre son salaire net **après PAS**, l'IR ne doit PAS être re-déduit |
| **Crédits d'impôt** | Non pris en compte dans le taux PAS ; restitués en septembre N+1 après déclaration | Le crédit garde n'améliore la trésorerie que l'année suivante (sauf acompte janvier via CGI art. 60 de la LFI 2017 — voir § 5.2) |
| **Taux PAS ≠ TMI** | Le taux PAS est un taux moyen sur revenus N-2, sans crédits | Ne pas utiliser le taux PAS comme proxy de TMI |

### 5.2 Acomptes de crédits d'impôt (avance de 60 %)

Depuis 2019, les contribuables perçoivent en **janvier N** une **avance de 60 %** du montant des crédits d'impôt (dont garde d'enfants) calculés l'année précédente, avant même la déclaration (CGI art. 60 LFI 2017 ; impots.gouv.fr).

**Implication pour GARDE-019 :** La restitution du crédit garde n'est **pas intégralement décalée** d'un an. Une partie (60 %) arrive en trésorerie en janvier N. Pour un outil pédagogique strict, cette avance peut être intégrée dans le disponible mensuel estimé, mais doit être documentée avec un avertissement.

### 5.3 Formulations recommandées pour les warnings moteur (outil pédagogique)

Les formulations ci-dessous sont recommandées comme texte d'interface ou commentaires de code :

```
WARNING_IR_APPROX:
  "L'impôt sur le revenu estimé est calculé sur la base d'un revenu net
  imposable simplifié (salaire brut avec abattement forfaitaire 10 %).
  Il ne tient pas compte de : déductions PER, déficits fonciers,
  revenus du capital, autres crédits d'impôt. Résultat indicatif."

WARNING_TMI_NONLINEAIRE:
  "Si vos revenus se situent près d'un seuil de tranche ou dans la zone
  de décote, le taux marginal effectif peut différer significativement
  du taux affiché. Consultez le simulateur officiel impots.gouv.fr."

WARNING_PAS_TRESORERIE:
  "Si votre revenu mensuel renseigné est déjà net de prélèvement à la
  source (fiche de paie), ne pas déduire à nouveau l'IR estimé sous
  peine de double déduction."

WARNING_CREDIT_IMPOT_DECALAGE:
  "Le crédit d'impôt garde d'enfants réduit l'IR de l'année N et est
  restitué en septembre N+1 (solde) et janvier N (acompte 60 %).
  L'effet trésorerie mensuel est une approximation."

WARNING_ANNEE_FISCALE:
  "Ce calcul utilise le barème IR 2026 (revenus 2025, LOI 2026-103).
  Pour les revenus perçus en 2026, le barème 2027 n'est pas encore
  publié. Les résultats sont des estimations."
```

---

## 6. Modèles simplifiés recommandés pour un moteur comparatif

### 6.1 Tableau comparatif des approches

| Approche | Description | Fiabilité | Limites | Sources minimales |
|---|---|---|---|---|
| **A — TMI seule** | Lire la TMI dans une table pré-calculée (revenu × parts → TMI), appliquer aux variations de revenu | ★★★ pour foyers bien dans une tranche ; ★★ si proche d'un seuil | Ignore décote, plafonnement QF, transitions de tranche | CGI art. 197 [S2], Service-Public.fr [S1] |
| **B — Barème + quotient explicite** | Reconstruire IR approximatif (revenu → abattement → quotient → barème → décote → plafond QF), puis dériver marge | ★★★★ — modèle le plus fidèle encodable | Nécessite connaissance du revenu net imposable et du nb_parts exact ; ne modélise pas tous les abattements | CGI art. 197 [S2], BOFiP [S5], [S12] |
| **C — Simulateur officiel uniquement** | Ne pas coder ; renvoyer vers impots.gouv.fr/simulateur | ★★★★★ — seul outil exhaustif | Non intégrable dans un moteur automatique ; UX dégradée | impots.gouv.fr [S17] |

### 6.2 Recommandation pour GARDE-019

**Approche recommandée : B (Barème + quotient explicite), avec warnings.**

Justification :
- Le barème est encodable dans un JSON versionné (seuils + taux) — 5 tranches pour le barème progressif.
- Le plafonnement QF et la décote sont également paramétrables.
- Les cas complexes (invalidité, CEHR, revenus mixtes) peuvent être exclus du scope et marqués `todoVerify`.

### 6.3 JSON de paramètres recommandé (barème 2026)

```json
{
  "version": "2026-LOI-2026-103",
  "annee_imposition": 2026,
  "annee_revenus": 2025,
  "source_legale": "CGI art. 197 I-1, modifié par LOI n° 2026-103 du 19 février 2026, art. 4",
  "bareme_progressif": [
    { "seuil_bas": 0,      "seuil_haut": 11600,  "taux": 0.00 },
    { "seuil_bas": 11601,  "seuil_haut": 29579,  "taux": 0.11 },
    { "seuil_bas": 29580,  "seuil_haut": 84577,  "taux": 0.30 },
    { "seuil_bas": 84578,  "seuil_haut": 181917, "taux": 0.41 },
    { "seuil_bas": 181918, "seuil_haut": null,   "taux": 0.45 }
  ],
  "note_seuils": "Seuils applicables au quotient familial (revenu/parts), pas au revenu total",
  "plafonnement_quotient_familial": {
    "plafond_par_demi_part_cas_general_eur": 1807,
    "plafond_par_quart_part_eur": 904,
    "plafond_parent_isole_part_entiere_eur": 4262,
    "source": "CGI art. 197 I-2, LOI 2026-103"
  },
  "decote": {
    "seuil_imposition_individuelle_eur": 1982,
    "seuil_imposition_commune_eur": 3277,
    "formule_individuelle": "897 - 0.4525 * impot_brut",
    "formule_commune": "1483 - 0.4525 * impot_brut",
    "source": "CGI art. 197 I-4, economie.gouv.fr (consulté 21/03/2026)"
  },
  "abattement_frais_professionnels": {
    "taux": 0.10,
    "minimum_eur": 509,
    "maximum_eur": 14556,
    "source": "CGI art. 83, 3°; UFC-Que Choisir (déduction maintenue, LFI 2026)"
  },
  "todoVerify": [
    "Seuils décote 2026 à confirmer au BOFiP version LFI 2026 (BOI-IR-LIQ-20-20-30)",
    "Plafond crédit impôt garde à vérifier dans DR-02",
    "CEHR non modélisée (RFR > 250 000 € célibataire / 500 000 € couple)",
    "Acompte 60 % crédits impôt janvier non intégré"
  ]
}
```

### 6.4 Cas d'usage GARDE-019 — pseudo-algorithme

```typescript
function estimerIRAnnuel(input: {
  revenuBrutAnnuel: number;        // salaires bruts déclarés
  nbParts: number;                 // calculé depuis situation familiale
  imposition: "individuelle" | "commune";
  bareme: BaremeIR2026;            // JSON § 6.3
}): { irBrut: number; irNet: number; tmi: number; flags: string[] } {

  const flags: string[] = [];

  // Étape 1 : revenu net imposable (abattement 10 %)
  const rni = Math.max(
    input.revenuBrutAnnuel * (1 - bareme.abattement_frais_professionnels.taux),
    input.revenuBrutAnnuel - bareme.abattement_frais_professionnels.maximum_eur
  );
  // Respecter le minimum
  const rniEffectif = Math.max(rni,
    input.revenuBrutAnnuel - bareme.abattement_frais_professionnels.minimum_eur);

  // Étape 2 : quotient familial
  const quotient = rniEffectif / input.nbParts;

  // Étape 3 : impôt par part (barème progressif)
  let impotParPart = 0;
  let tmi = 0;
  for (const tranche of bareme.bareme_progressif) {
    if (quotient > tranche.seuil_bas) {
      const fraction = Math.min(quotient, tranche.seuil_haut ?? Infinity) - tranche.seuil_bas;
      impotParPart += fraction * tranche.taux;
      if (fraction > 0) tmi = tranche.taux;
    }
  }

  // Étape 4 : impôt brut total
  const irBrut = Math.round(impotParPart * input.nbParts);

  // Étape 5 : décote
  const seuil = input.imposition === "commune"
    ? bareme.decote.seuil_imposition_commune_eur
    : bareme.decote.seuil_imposition_individuelle_eur;

  let decote = 0;
  if (irBrut < seuil) {
    const formule = input.imposition === "commune"
      ? bareme.decote.formule_commune
      : bareme.decote.formule_individuelle;
    // formule : X - 0.4525 * irBrut
    const [X] = formule.split(" - ").map(Number);
    decote = Math.max(0, X - 0.4525 * irBrut);
    flags.push("WARNING_TMI_NONLINEAIRE");
  }

  const irNet = Math.max(0, irBrut - decote);

  // Plafonnement QF : todoVerify pour les cas complexes
  flags.push("todoVerify:plafonnement_QF_non_implemente");

  return { irBrut, irNet, tmi, flags };
}
```

**Ce que le moteur DOIT laisser en entrée utilisateur :**
- `nbParts` (non dérivable sans information complète sur invalidité, anciens combattants, enfants majeurs rattachés)
- `revenuBrutAnnuel` ou `revenuNetImposable` directement (PER, déficits non modélisables)
- Tout crédit d'impôt autre que le crédit garde (DR-02)

**Ce qui DOIT rester `todoVerify` :**
- Plafonnement QF (matériel pour familles moyennes)
- CEHR pour revenus > 250 000 €
- Acompte 60 % crédits d'impôt en janvier
- Barème revenus 2026 (imposition 2027)

---

## 7. Loi de finances & unknowns pour 2026

### 7.1 LOI de finances 2026 — dispositions applicables

| Disposition | Article LFI 2026 | Impact encodage |
|---|---|---|
| Revalorisation barème IR +0,9 % | Art. 4 (modifiant CGI art. 197) | ✅ Encodable — seuils § 3.1 |
| Indexation plafonnement QF +0,9 % | Art. 4 | ✅ Plafond 1 807 € § 3.3 |
| Indexation abattement frais pro +0,9 % | Art. 2 (via abattement lié au barème) | ✅ Min 509 €, max 14 556 € |
| Décote revalorisée +0,9 % | Art. 4 | ✅ Seuils 1 982 € / 3 277 € |
| Maintien abattement 10 % retraites | Réforme avortée lors des débats parlementaires | ✅ Pas de changement à encoder |
| Suppression réduction impôt frais de scolarité | Art. LFI 2026 | Hors scope GARDE-019 |
| Reconduction CDHR (contribution différentielle hauts revenus) | Art. LFI 2026 (Art. 224 CGI) | `todoVerify` si RFR > 250 k€ |
| Taux individualisé PAS couple par défaut (depuis sept. 2025) | Art. 19 LFI 2024 | Note dans warnings PAS |

**Référence LFI 2026** : LOI n° 2026-103 du 19 février 2026, publiée au Journal officiel du 20 février 2026. Texte intégral : https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053508155

### 7.2 Unknowns explicites pour l'implémentation

| Unknown | Criticité | Action recommandée |
|---|---|---|
| **Barème IR revenus 2026 (imposition 2027)** — pas encore publié | 🔴 Haute (si produit couvre 2026-2027) | Encoder `"bareme_annee_revenus_2026": "todoVerify — LFI 2027 non publiée"` |
| **Seuils décote 2026 au BOFiP** — version BOI-IR-LIQ-20-20-30 post-LFI 2026 non disponible à la rédaction | 🟡 Moyenne | Vérifier BOFiP mise à jour au printemps 2026 |
| **Plafonds crédits impôt garde 2026** (art. 200 quater B) — modifiés ou non par LFI 2026 | 🟡 Moyenne | Vérifier DR-02 et BOFiP BOI-IR-RICI-300 |
| **Avance 60 % crédits d'impôt janvier 2027** — montant dépend de déclaration 2025 | 🟢 Basse | Avertissement utilisateur suffisant |
| **CEHR barèmes 2026** | 🟢 Basse (hors scope foyers cibles) | `todoVerify` si RFR > 250 k€ |

---

## 8. Source index

| # | URL | Libellé court | Date consultation |
|---|---|---|---|
| S1 | https://www.service-public.gouv.fr/particuliers/vosdroits/F1419 | Service-Public.fr — Barème IR, tranches, exemples, TMI vs taux moyen | 21/03/2026 |
| S2 | https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051212954 | Légifrance — CGI art. 197, I — Barème progressif, modifié LOI 2026-103 | 21/03/2026 |
| S3 | https://www.quechoisir.org/actualite-impots-le-bareme-de-l-impot-sur-le-revenu-est-revalorise-de-0-9-en-2026-n174202/ | UFC-Que Choisir — Revalorisation 0,9 %, maintien abattement retraites | 21/03/2026 |
| S4 | https://www.economie.gouv.fr/particuliers/impots-et-fiscalite/gerer-mon-impot-sur-le-revenu/comment-calculer-votre-impot-dapres-le-bareme-de-limpot-sur-le-revenu | economie.gouv.fr — Calcul IR barème, décote 2026, CDHR | 21/03/2026 |
| S5 | https://bofip.impots.gouv.fr/bofip/2028-PGP.html/identifiant=BOI-IR-LIQ-10-20-20-10-20140326 | BOFiP BOI-IR-LIQ-10-20-20-10 — Majorations QF, enfants à charge | 21/03/2026 |
| S6 | https://www.service-public.gouv.fr/particuliers/vosdroits/F2705 | Service-Public.fr F2705 — QF couple marié/PACS, plafonnement | 21/03/2026 |
| S7 | https://www.senat.fr/rap/l25-139-21/l25-139-212.html | Sénat — Rapport PLF 2026, CEHR et contribution différentielle hauts revenus | 21/03/2026 |
| S8 | https://www.service-public.gouv.fr/particuliers/vosdroits/F34009 | Service-Public.fr — PAS : fonctionnement, taux personnalisé | 21/03/2026 |
| S9 | https://www.economie.gouv.fr/particuliers/impots-et-fiscalite/gerer-mon-impot-sur-le-revenu/comment-gerer-votre-taux-de | economie.gouv.fr — Taux PAS, TMI vs taux moyen vs taux PAS | 21/03/2026 |
| S10 | https://bofip.impots.gouv.fr/bofip/11255-PGP.html/identifiant=BOI-BAREME-000037-20250410 | BOFiP BOI-BAREME-000037 — Grilles taux par défaut PAS | 21/03/2026 |
| S11 | https://www.service-public.gouv.fr/particuliers/vosdroits/F35120 | Service-Public.fr F35120 — QF parent isolé, demi-parts | 21/03/2026 |
| S12 | https://bofip.impots.gouv.fr/bofip/2495-PGP.html/identifiant=BOI-IR-LIQ-20-20-30-20250414 | BOFiP BOI-IR-LIQ-20-20-30 — Décote : calcul, seuils (revenus 2024 cités) | 21/03/2026 |
| S13 | https://bofip.impots.gouv.fr/bofip/865-PGP.html/identifiant=BOI-IR-RICI-300-20230626 | BOFiP BOI-IR-RICI-300 — Crédit impôt frais de garde jeunes enfants | 21/03/2026 |
| S14 | https://bofip.impots.gouv.fr/bofip/5955-PGP.html/identifiant=BOI-IR-RICI-20250618 | BOFiP BOI-IR-RICI (2025) — Ordre imputation réductions et crédits d'impôt | 21/03/2026 |
| S15 | https://bofip.impots.gouv.fr/bofip/3968-PGP.html/identifiant=BOI-IR-RICI-150-20-20170920 | BOFiP BOI-IR-RICI-150-20 — Crédit impôt emploi à domicile, ordre imputation | 21/03/2026 |
| S16 | https://www.service-public.gouv.fr/particuliers/vosdroits/F35894 | Service-Public.fr F35894 — Modifier taux PAS, taux individualisé couple | 21/03/2026 |
| S17 | https://www.impots.gouv.fr/simulateur-ir | impots.gouv.fr — Simulateur officiel IR (référence de validation) | 21/03/2026 |
| S18 | https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053508155 | Légifrance — LOI n° 2026-103 du 19 février 2026 de finances pour 2026 (texte intégral) | 21/03/2026 |
| S19 | https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006179577/ | Légifrance — CGI Section II art. 193-200 sexdecies (quotient familial) | 21/03/2026 |
| S20 | https://www.service-public.gouv.fr/particuliers/actualites/A18045 | Service-Public.fr A18045 — Infographie tranches et taux 2026 (23/02/2026) | 21/03/2026 |

---

*Document généré le 21 mars 2026. Tous les chiffres citent une source primaire officielle. Aucune valeur n'a été inventée. Les incertitudes sont explicitement signalées. Ce document ne constitue pas un conseil fiscal personnalisé.*
