# Review E3 — Simulateurs de scénario : dépendances et extractions

Objectif : inventorier ce que font les quatre `compute*` avant d’implémenter **E3 — Shared helpers** (couche transverse type IR / disponible après impôt, voir [`DR-07`](./research/DR-07-IR-TMI-DISPONIBLE.md)).

---

## 1. Cartographie par scénario

| Slug                       | Fichier                                                                                   | Modules `src/shared` utilisés                                              | Logique propre au scénario                                                                                        |
| -------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `creche-publique`          | [`creche-publique/index.ts`](../src/scenarios/creche-publique/index.ts)                   | `credit-garde-hors-domicile`, `load-rules`                                 | Part familiale mensuelle + CMG **structure** (facture) ; pas d’emploi direct.                                     |
| `creche-berceau-employeur` | [`creche-berceau-employeur/index.ts`](../src/scenarios/creche-berceau-employeur/index.ts) | idem + `avantage-employeur-creche`                                         | Même pipeline F8 que la crèche publique + **seuil d’exonération** aide employeur (excédent imposable).            |
| `assistante-maternelle`    | [`assistante-maternelle/index.ts`](../src/scenarios/assistante-maternelle/index.ts)       | `cmg-assmat-emploi-direct`, `credit-garde-hors-domicile`, `load-rules`     | Coût employeur ; CMG **emploi direct assmat** (saisie ou formule pack) ; crédit **hors domicile** (200 quater B). |
| `nounou-domicile`          | [`nounou-domicile/index.ts`](../src/scenarios/nounou-domicile/index.ts)                   | `cmg-garde-domicile-emploi-direct`, `credit-emploi-domicile`, `load-rules` | Même squelette « coût employeur + CMG » ; crédit **emploi à domicile** (199 sexdecies), pas F8 garde hors dom.    |

**Constat** : les règles métier **CMG** et **crédits d’impôt** sont déjà dans des modules dédiés (`credit-*`, `cmg-*`, `avantage-employeur-creche`). Les scénarios les **orchestrent** et remplissent la `trace`.

---

## 2. Patterns répétés (bons candidats à factoriser _sans_ mélanger les règles)

Ces blocs se retrouvent quasi à l’identique dans plusieurs fichiers :

| Pattern                                                                               | Où                                                                               | Intérêt d’extraction                                                                                                                                    |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Normalisation foyer** : `childrenCount ≥ 1` entier, `custody` full/shared           | Crèches, assmat                                                                  | Une fonction `normalizeHouseholdChildContext` évite les copier-coller.                                                                                  |
| **`netMonthlyCashAfterCmgEur`** = coût mensuel − CMG mensuelle                        | Les 4 (assmat/nounou : coût employeur ; crèches : participation − CMG structure) | Pure arithmétique ; nom explicite dans un helper évite les erreurs de signe.                                                                            |
| **`monthlyCreditEquivalentEur`** = crédit annuel / 12                                 | Les 4                                                                            | Idem ; garde le lien « annuel pack → mensualisation pédagogique » au même endroit.                                                                      |
| **`netMonthlyBurdenAfterCreditEur`** = net cash après CMG − équivalent mensuel crédit | Les 4                                                                            | C’est le **reste à charge cash net de crédit** avant toute couche IR (E3).                                                                              |
| **Résolution CMG** : saisie `monthlyCmgPaidEur` **ou** revenu pour formule pack       | Assmat et nounou (≈ 40 lignes dupliquées)                                        | Helper `resolveMonthlyCmgFromInput({ explicit, incomeForFormula, cost, rank, computeFromPack })` avec types de détail différents (génériques ou union). |

**À ne pas fusionner à la légère** : l’appel à `computeCreditGardeHorsDomicileAnnual` vs `computeCreditEmploiDomicileAnnual` — assiettes et paramètres pack diffèrent ; un seul « méga crédit » serait opaque.

---

## 3. Ce qui est _déjà_ bien isolé (E2 / shared actuel)

- **Crédit garde hors domicile** : [`credit-garde-hors-domicile.ts`](../src/shared/credit-garde-hors-domicile.ts)
- **Crédit emploi à domicile** : [`credit-emploi-domicile.ts`](../src/shared/credit-emploi-domicile.ts)
- **CMG assmat emploi direct** : [`cmg-assmat-emploi-direct.ts`](../src/shared/cmg-assmat-emploi-direct.ts)
- **CMG garde à domicile** : [`cmg-garde-domicile-emploi-direct.ts`](../src/shared/cmg-garde-domicile-emploi-direct.ts)
- **Avantage employeur crèche** : [`avantage-employeur-creche.ts`](../src/shared/avantage-employeur-creche.ts)
- **Chargement pack** : [`load-rules.ts`](../src/shared/load-rules.ts)

Aucun besoin de « ré-extraire » ces fichiers pour E3 ; E3 s’ajoute **après** la trace `netMonthlyBurdenAfterCreditEur` (ou en parallèle pour sensibilisation).

---

## 4. Cible E3 « fiscal transversal » (nouveaux modules)

Aligné [`DR-07`](./research/DR-07-IR-TMI-DISPONIBLE.md) et l’epic **E3** du sprint plan — **pas encore dans les simulateurs** :

| Module (proposition)                 | Rôle                                                                                                                        | Dépendance config                             |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `ir-bareme.ts` (ou données JSON)     | Barème progressif par parts / quotient                                                                                      | Seuils + taux 2026 dans `config/rules.*.json` |
| `ir-tmi.ts`                          | TMI **marginale** (tranche du quotient) + garde-fous PAS ≠ TMI                                                              | DR-07 §2–3                                    |
| `disponible-apres-ir.ts` (optionnel) | À partir d’un revenu net imposable saisi (ou stub) : IR approximatif, restitution partielle crédits, **disponible mensuel** | Simplifications explicites (`todoVerify`)     |
| Types / façade                       | Entrée satellite : `revenuNetImposableEur`, `nombreParts`, pas de double comptage avec crédits garde déjà en trace          | Spec INITIAL                                  |

Ces modules ne remplacent pas les scénarios : ils **consomment** une sortie (ex. `netMonthlyBurdenAfterCreditEur` × 12) ou des hypothèses foyer pour un **comparatif « après IR »** pédagogique.

---

## 5. Ordre de travail recommandé

1. **Factorisation légère** (réduction duplication assmat/nounou + helpers cashflow à 3 lignes) — **hors IR**, fichier type `src/shared/monthly-cashflow-after-aides.ts` ou équivalent. **Fait** (2026-03-24) : modules [`monthly-cashflow-after-aides.ts`](../src/shared/monthly-cashflow-after-aides.ts), [`cmg-from-employment-input.ts`](../src/shared/cmg-from-employment-input.ts), [`household.ts`](../src/shared/household.ts), tests associés ; les quatre `compute*` les utilisent.
2. **Paramètres IR dans le pack** + lecture Zod (comme les autres règles).
3. **Barème + TMI** puis option **disponible** ; tests sur cas DR-07 §3.

Document maintenu pour la story [`GARDE-013`](./stories/GARDE-013.md).
