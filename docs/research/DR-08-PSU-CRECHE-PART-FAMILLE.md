# DR-08 — Participation familiale en crèche : PSU (inter-entreprises, conventionnée) vs micro-crèche (PAJE / CMG)

## Executive summary

Pour une **crèche conventionnée PSU** (y compris **inter-entreprises** ou **micro-crèche sous PSU**), la **part payée par le parent** (_participation familiale_) est en principe celle du **barème national** (ressources du foyer, composition, volume d’accueil) : **elle ne dépend pas** du fait que l’employeur réserve une place ou finance le reliquat pour la structure. L’**employeur** intervient sur **coût réel − aide publique (PSU, etc.) − participation familiale**, pas en réduisant le barème parental. Pour une **micro-crèche hors PSU** (ou autre EAJE relevant du **CMG « structure »**), les **tarifs sont libres** (dans la limite d’éligibilité PAJE, ex. plafond horaire pour l’aide) : le **reste à charge** dépend alors **fortement du contrat** et de la structure. Ce document formalise cette distinction pour le produit ; le **moteur** ne calcule pas le barème PSU : il attend `monthlyParticipationEur` (facture / avis d’échéance, ou estimation via **monenfant.fr** « Simuler le coût en crèche », ou barème Cnaf — **à ne pas confondre** avec les simulateurs **d’aides** caf.fr type CMG). Voir aussi **DR-04** (coûts par mode), **DR-01** (CMG structure vs PSU non modélisé).

---

## 1. Principe : qui paie quoi ?

### Crèche inter-entreprises (ou berceau conventionné PSU)

- **Structure / financeurs** : coût réel de la place, aide **PSU** (CAF), **participation des employeurs** (réservation, complément), selon conventions.
- **Parent** : paie la **participation familiale** fixée par le **barème** (identique en logique à une crèche municipale / EAJE PSU du même type).
- **Employeur** : couvre en général l’écart entre le coût global facturé à la structure et ce que paient **CAF + familles** — **sans** substituer un « rabais » sur la part barémée parentale dans le modèle économique standard décrit par la CAF pour le PSU.

### Micro-crèche (ou EAJE) **hors PSU**

- Tarification **contractuelle** ; aide familles souvent via **CMG** (branche structure, **DR-01**), pas via le même mécanisme PSU.
- Le **reste à charge** est **très dépendant** de l’établissement et du tarif horaire / forfait.

---

## 2. Barème PSU (part familiale)

Les règles précises (revenus de référence, planchers, plafonds, **taux d’effort** par nombre d’enfants, prise en compte du temps d’accueil) sont **nationales** et **mises à jour** par la **CAF** / instruction PAJE. Le produit **ne duplique pas** ces tableaux dans le code : l’utilisateur ou l’agent collecte la **facturation réelle**, le résultat du **simulateur de reste à charge** sur **monenfant.fr** (crèche en PSU), ou une lecture des **publications barème / guide PSU** (Cnaf, caf.fr) — **pas** le seul hub caf.fr « Estimer vos droits », qui vise surtout les **aides** (CMG, etc.).

**Forme qualitative retenue** : participation familiale ≈ fonction **(revenus, nb enfants à charge pour le barème, heures / jours d’accueil)**, encadrée par des **minima / maxima** légaux ou réglementaires publiés.

> **Note** : toute grille chiffrée (ex. taux d’effort, plafond de revenus) doit être **vérifiée** sur les publications **CAF / service-public** pour l’année d’imposition concernée ; ne pas coder de constantes non sourcées.

### Sans place encore : peut-on estimer la part parent ?

**Crèche conventionnée PSU** (souvent publique, inter-entreprises, nombreuses crèches privées conventionnées) :

- **Oui, en ordre de grandeur**, parce que la participation familiale dépend surtout de la **situation du foyer** (ressources prises en compte — souvent **N-2**, nombre d’enfants dans le barème, **volume d’accueil** prévu : temps plein / partiel, heures ou jours par mois) et **pas** du nom de la crèche, **à structure et convention PSU équivalentes**.
- **Part prix parent (PSU)** : **monenfant.fr** — _Simuler le coût en crèche_ (https://www.monenfant.fr/simuler-le-cout-en-creche) : estime le **reste à charge mensuel** des familles pour une crèche bénéficiant de la subvention PSU (barème national Cnaf) ; résultat **indicatif** (voir CGU sur le site). **Ne pas substituer** les simulateurs **d’aides** CAF / MSA (CMG, « Estimer vos droits », etc.) : ils ne remplacent pas cet objet.
- **Aides type CMG** (micro-crèche hors PSU, etc.) : simulateurs et règles **CAF** / **MSA** — voir **DR-01** ; **prise de contact** avec un conseiller, parfois **grilles d’exemple** publiées par une **mairie** ou un **conseil départemental** (à titre illustratif).
- **Limites** : le montant **définitif** figure sur la **facture / avis de paiement** de la structure une fois l’accueil paramétré ; des postes peuvent s’ajouter (**repas**, garderie, adhésion) ; un changement de revenus déclarés ou de mode d’accueil fait **évoluer** le barème.

**Micro-crèche ou EAJE hors PSU** (tarif libre, CMG « structure » éventuel) :

- **Pas de barème national unique** pour la part crèche : sans place ou sans devis, il faut des **fourchettes** issues de **plusieurs devis** ou des tarifs affichés par les structures, puis éventuellement estimer l’aide **CMG** via les outils / règles **CAF** (voir **DR-01**). Le moteur du dépôt peut aider **côté CMG** si les entrées sont fournies, **pas** côté barème PSU.

---

## 3. Synthèse produit / moteur

| Type d’accueil                                                          | Mécanisme aide / tarif parent                                                  | `brutInput.mode` côté moteur                                                  | CMG dans le moteur (rappel)                                                       |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Crèche **PSU** (publique, privée conventionnée, **inter-entreprises**…) | Barème national ; même logique de **part familiale** pour une situation donnée | `creche_publique`, `creche_inter_entreprises`, parfois `creche_privee` si PSU | Souvent **`unsupported`** (PSU ≠ branche CMG structure modélisée) — **GARDE-007** |
| Micro-crèche **hors PSU** (PAJE / CMG)                                  | Tarif libre (plafond horaire pour éligibilité aide — **DR-01**)                | `creche_privee`                                                               | **CMG structure** (tranches, etc.) si éligible                                    |

---

## 4. Implications harness

- Pour **`creche_publique`** et **`creche_inter_entreprises`** : demander la **participation familiale mensuelle réelle** (avis d’échéance, espace allocataire, crèche) ; expliquer qu’elle suit le **barème PSU**, **pas** un pourcentage arbitraire de prise en charge employeur sur cette part. **Si l’utilisateur n’a pas encore la place** : pour un scénario **PSU**, proposer un **ordre de grandeur** via **monenfant.fr** (_Simuler le coût en crèche_), **conseiller CAF / MSA / gestionnaire**, ou **barème publié** (Cnaf) ; saisir ce montant comme **hypothèse** et le dire clairement à l’utilisateur (à confirmer à réception du contrat / premier avis). Les simulateurs **d’aides** sur caf.fr ne sont **pas** l’équivalent pour la **part familiale** PSU.
- Pour **`creche_privee`** : clarifier si la structure est **PSU** ou **PAJE / CMG** pour orienter les attentes (barème national vs contrat + CMG structure). Sans place : **devis / fourchettes** de structures ou hypothèse explicite utilisateur.

---

## 5. Références croisées

- **DR-04** — Mode « Crèche inter-entreprises » (aligné sur ce DR).
- **DR-01** — CMG structure (micro-crèche) vs PSU.
- **GARDE-007** — Règles CMG + non-support PSU explicite.

---

## Source index

- **monenfant.fr** — simulateur **reste à charge** crèche PSU (part familiale) : https://www.monenfant.fr/simuler-le-cout-en-creche
- Publications **caf.fr** / **Cnaf** (guides / barèmes PSU, participation des familles) ; **service-public.gouv.fr** (PAJE, modes d’accueil).
- **DR-04** (composantes de coût et exemples).
