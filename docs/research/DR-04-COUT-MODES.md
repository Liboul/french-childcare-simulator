## Executive summary

This report breaks down the typical cost components of each childcare mode in France. For each mode, we list recurring fees (salary, cotisations, meals, etc.), who sets them (national law/convention, local authority, or private contract) and give representative examples from official sources. We also distinguish which costs are mandated (e.g. social charges by URSSAF) versus flexible (e.g. negotiated salary, local tariffs). For example, municipally-run crèches use a _quotient familial_ formula (Paris cites €2.62–149.90 per month depending on family income【42†L755-L764】【42†L765-L774】), while private micro-crèches set an hourly rate (capped at €10/h for eligibility to CAF aid【47†L269-L272】【68†L235-L243】). National frameworks (collective agreements, CAF barèmes) give high-level caps (e.g. SMIC €12.02/h【6†L89-L94】; crèche PSU €5.26/h【39†L63-L71】), but many items (e.g. local fees, partages in garde partagée) vary by location or contract. The structured tables below and input lists will feed the software’s scenario logic (block G) for calculating _reste à charge_ after state aid (handled in other DRs).

|Note: All salary figures are gross. Caf/impôt aids (CMG, crédit impôt) are treated separately (see DR-01/DR-02). Examples are from official or municipal sources when possible; otherwise marked indicative.|

## Mode — Nounou à domicile

| Composante                        | Souvent présente ?           | Fixée par                                   | Exemple chiffré                                                                   | Source type                |
| --------------------------------- | ---------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------- |
| **Salaire horaire**               | Yes                          | Contrat employeur/CCN (Services à la pers.) | ≥ SMIC (12,02 €/h brut 2026)【6†L89-L94】 (min CCN ≈12,51 € brut【68†L235-L243】) | Légifrance/CCN             |
| **Heures complémentaires/suppl.** | Oui, souvent _au-delà_ 8 h/j | CCN (majorations légales : +25–50 %)        | Majoration 25 % à 50 % (ccn)                                                      | CCN / Urssaf               |
| **Cotisations sociales**          | Yes                          | Loi (URSSAF/Pajemploi rates)                | ≈25 % patronales + ≈20 % salariales【68†L278-L283】                               | URSSAF/Pajemploi           |
| **Indemnité repas/goûter**        | Parfois (selon accord)       | Contrat / Accords conventionnels            | ~4–5 € par repas (exemple indicatif)                                              | Contrat privé              |
| **Frais de déplacement**          | Parfois                      | Contrat / barème kilométrique URSSAF        | ~0.43 €/km (voiture 1CV, 2026)                                                    | Urssaf (barèmes km)        |
| **Cotisations CESU / Pajemploi**  | Optional (if CESU used)      | Tarif URSSAF (forfait service)              | Exemple : 0,50 €/bulletin à part (CESU)                                           | Service-Public (CESU)      |
| **Contrat/adhésion agence**       | Optional                     | Contrat / règlement interne agence          | e.g. frais d’inscription ponctuels                                                | Entreprise/municipal (ex.) |
| **Repas, couches, sorties**       | Non (pris par parents)       | N/A                                         | Parent fournit repas/goûter                                                       | –                          |
| **Pénalités de retard**           | Parfois (locaux/privés)      | Règlement intérieur contrat                 | e.g. 1–2 € par 10 min de retard (ex.)                                             | Contrat type (privé)       |

Cette mode est un **emploi direct du salarié par la famille**. Le salaire est librement négocié mais doit respecter le SMIC (12,02 € brut/h en 2026【6†L89-L94】) et la convention collective des particuliers employeurs (minimaux 12,51 € pour niveau III, cf. ci-dessus【68†L235-L243】). Les cotisations sociales obligatoires (charges employeur et salarié) sont calculées selon les taux Urssaf (environ 25 % de charges patronales en régime Pajemploi【68†L278-L283】). Les frais liés à l’emploi (CESU/Pajemploi) peuvent inclure une petite commission ou abonnement. Les indemnités en nature (repas fournis par l’employeur) sont envisagées en avantage en nature dans le contrat. Les pénalités de retard ne sont pas légales mais peuvent figurer dans le contrat (souvent quelques euros par minute de dépassement). Les exemples chiffrés indiquent des ordres de grandeur ou minima conventionnels (SMIC, minima CCN【6†L89-L94】【68†L235-L243】).

**Inputs (parent/family)**

- Salaire horaire brut (€), heures travaillées (h/mois)
- Heures supp. (h/mois) au-delà de 40 h (inc. % majoré)
- Nombre de repas fournis à l’enfant (repas facturés)
- Déplacement (km/mois ou indemnités kilométriques)

**Defaults**: SMIC = 12,02 €/h (2026)【6†L89-L94】 (unless user enters higher).  
**Derived**: `salaire_brut_mensuel = salaire_horaire_brut × heures` ; `charges_patro = taux_patro × salaire_brut` ; `charges_salaire = taux_salarié × salaire_brut` ; `coût_total = salaire_brut + charges_patro`.

## Mode — Nounou partagée

| Composante                   | Souvent présente ?                 | Fixée par                  | Exemple chiffré                                                               | Source type          |
| ---------------------------- | ---------------------------------- | -------------------------- | ----------------------------------------------------------------------------- | -------------------- |
| **Salaire horaire**          | Yes                                | CCN / contrat (2 familles) | Cat. A : 12,51 €/h brut (2026)【68†L235-L243】 (+10% si 2 enfants simultanés) | CCN (Services Pers.) |
| **Majoration multi-enfants** | Oui (garde simultanée 2 + enfants) | CCN (10% par enfant sup.)  | +10 % à partager (ex.: +1,25 €)【68†L263-L270】                               | CCN                  |
| **Répartition du salaire**   | Oui                                | Contrat des familles       | Typiquement 50/50 (ou prorata)                                                | Contrat privé        |
| **Cotisations sociales**     | Yes                                | Loi (URSSAF/Pajemploi)     | ≈25 % employeur du brut (par famille)【68†L278-L283】                         | Urssaf/Pajemploi     |
| **Indemnité repas/goûter**   | Parfois                            | Contrat / usage local      | À répartir/ajouter selon entente                                              | Contrat privé        |
| **CESU/Pajemploi**           | Obligation\*\* Pajemploi           | Pajemploi (URSSAF)         | Service PUJ (Urssaf)\*                                                        | Urssaf (Pajemploi)   |

\*La déclaration de la garde partagée se fait obligatoirement via Pajemploi (service Urssaf)【68†L371-L379】.

Dans la garde partagée, deux familles emploient **ensemble la même salariée**. La loi (convention collective) prévoit un salaire de base commun (min. 12,51 €/h brut pour niveau III【68†L235-L243】) et surtout une **majoration de 10%** dès qu’elle garde deux enfants simultanément【68†L253-L259】. Cette majoration totale (par ex. +1,25 €/h sur 12,51 €) est partagée entre les familles (souvent à parts égales). Les charges sociales sont calculées comme pour l’emploi direct (géré via Pajemploi) et estimées à ~25 % du brut par famille【68†L278-L283】. **La répartition du coût total entre familles n’est pas fixée par la loi** (liberté contractuelle)【68†L290-L299】 – pratique courante : 50/50 ou au prorata des heures ou du nombre d’enfants. Chaque famille déclare sa part de salaire (et bénéficie séparément du CMG via la CAF, si éligible【68†L326-L334】【68†L338-L342】).

**Inputs (two-family scenario)**

- Salaire horaire brut de la nounou (€) et heures total (h/mois)
- Partage (%) ou heures par famille (ex. 50/50 ou prorata)
- Nombre d’enfants gardés simultanément par la nounou (pour +10% chaque enfant en plus)

**Defaults**: maj. 10% automatiquement appliquée (pas besoin d’entrée).  
**Derived**: `salaire_horaire_majoré = salaire_horaire_brut × (1 + 0.10*(n_enfants-1))` ; `salaire_brut_total = salaire_horaire_majoré × total_heures` ; `salaire_par_famille = part_famille × salaire_brut_total` ; `charges_patro_fam = taux_patro × salaire_par_famille`.

## Mode — Assistante maternelle

| Composante                    | Souvent présente ? | Fixée par               | Exemple chiffré                                                 | Source type                 |
| ----------------------------- | ------------------ | ----------------------- | --------------------------------------------------------------- | --------------------------- |
| **Salaire horaire brut**      | Yes                | CCN (Assistantes mat.)  | ≥ 3,79 €/h brut (conv. min)                                     | CCN (assistantes mat.)      |
| **Heures complémentaires**    | Oui (> 45h/sem.)   | CCN (25% first 8h sup.) | +25 % (au-delà 45h/sem)                                         | CCN                         |
| **Indemnité d’entretien**     | Yes (par jour)     | CCN / loi (forfait)     | ≥ 2,65 € par j (6–9h)【62†L93-L100】 (≈4,47 € pour 10h30/j ex.) | Service-Public (simulateur) |
| **Indemnité de repas/goûter** | Oui (si fournit)   | Contrat (convention)    | e.g. 6 € repas complet; 4,50 € repas seul                       | Usages (exemple)            |
| **Cotisations sociales**      | Yes                | Loi (URSSAF/Pajemploi)  | ~25–45 % patronales (assmat pro)                                | Urssaf/Pajemploi            |
| **Mutuelle**                  | Parfois\*          | CCN (min. 4 salariés)   | Néant si <4 salariés                                            | CCN                         |

Les assistantes maternelles agréées sont **salariées à leur domicile ou MAM** par le particulier employeur. Le salaire brut horaire a un plancher légal (3,38 € brut/h) et conventionnel (environ 3,79 € brut/h minimum pour 2026)【62†L93-L100】. De plus, on verse des indemnités d’entretien par journée de présence (au moins 2,65 € pour un accueil ≤9h30) qui couvrent nourriture, jouets, etc.【62†L93-L100】. Les indemnités de repas (le cas échéant fournies par l’assmat) sont fixées en contrat (exemple 6 € pour repas complet, etc. selon usages locaux). Le salaire est obligatoirement mensualisé (voir CCN) et les cotisations calculées via Pajemploi (URSSAF).

**Inputs (parent)**

- Salaire horaire brut assistante maternelle (€)
- Nombre de jours d’accueil (jours/mois) et durée par jour (h/jour)
- Indemnités forfaitaires (entretien €/jour, repas €/repas)

**Defaults**: indemnité entretien légale = 2,65 €/jour (0–6h15) ou barème réparti par durée【62†L93-L100】. Salaire min. brut = 3,79 €/h (ref. CCN).  
**Derived**: `indemn_entretien = f(durée)` (simulateur selon loi) ; `salaire_brut_mens = salaire_horaire_brut × heures_totales` ; `cotisations = taux × salaire_brut_mens`.

## Mode — MAM (Maison d’Assistantes Maternelles)

| Composante                       | Souvent présente ?   | Fixée par                 | Exemple chiffré             | Source type        |
| -------------------------------- | -------------------- | ------------------------- | --------------------------- | ------------------ |
| **Salaire (per child)**          | Yes                  | CCN Assistante maternelle | Même règles qu’assmat       | CCN assistant mat. |
| **Indemnité entretien**          | Yes                  | CCN / contrat             | ≥ 2,65 €/jour (min)         | Service-Pub\*\*    |
| **Cotisations sociales**         | Yes                  | Loi (URSSAF/Pajemploi)    | ~25–45% patronal            | URSSAF/Pajemploi   |
| **Participation fonctionnement** | Often (locaux, mat.) | Statuts MAM / commune     | e.g. 20–50 € mois\*         | Règlement MAM      |
| **Caution / adhésion**           | Parfois              | Contrat / association     | e.g. dépôt ~2 mois (ex.)    | Association locale |
| **Repas**                        | Oui (souvent inclus) | Mairie or CAF conventions | géré par MAM, calculé au QF | Communal/CAF       |

Dans une MAM, plusieurs assmats accueillent des enfants ensemble. Les **parents paient chaque mois un salaire à l’assmat** (comme ci-dessus) **+ souvent une participation aux frais de structure** (loyer, charges de la maison, fournitures) déterminée par le règlement de la MAM ou la mairie. Par exemple, certaines MAM demandent 20–50 € par mois et par famille en plus du salaire de l’assmat (cas hypothétique). Les indemnités d’entretien et de repas suivent les mêmes règles qu’en garde individuelle (forfait conventionnel minimum 2,65 €/jour【62†L93-L100】). Les cotisations du personnel sont gérées via Pajemploi. Tout excédent (repas supplémentaire, sorties) ou pénalité éventuelle serait prévu par le règlement interne de la MAM.

**Inputs (parent)**

- Salaire horaire brut de l’assmat (€/h) et heures/mois par enfant
- Participation (€/mois) aux frais de la MAM (loyer, matériel)
- Indemnités (entretien €/jour, repas €/repas)

**Defaults**: salaire min. 3,79 €/h; indemnité entretien ≥2,65 €/j.  
**Derived**: `frais_mensuels_MAM = participation_famille` ; `cotisations = taux × (salaire_horaire × heures)`.

## Mode — Crèche publique

| Composante                        | Souvent présente ?     | Fixée par                               | Exemple chiffré (Paris)                                    | Source type         |
| --------------------------------- | ---------------------- | --------------------------------------- | ---------------------------------------------------------- | ------------------- |
| **Tarif service (participation)** | Yes                    | Barème CAF national (quotient familial) | 2,62 € – 149,90 € par mois【42†L755-L764】【42†L765-L774】 | Site Mairie Paris   |
| **Heures d’accueil**              | Yes (limitées)         | Réglementation municipale               | 8 h15-17h (9am-5pm)                                        | Site Mairie Paris   |
| **Repas**                         | Oui (obligatoire)      | Service municipal (Caisse des écoles)   | Calculé au QF (non inclus ci-dessus)                       | Site Mairie Paris   |
| **Inscription / caution**         | Parfois                | Règlement local                         | Peut exiger dépôt de garantie                              | Mairie locale       |
| **Pénalités retards**             | Parfois (garderie)\*\* | Règlement intérieur crèche              | e.g. 1 €/10 min (ex.)                                      | Règlement municipal |
| **Forfait fréquentation**         | Parfois (50 % pt.tps)  | Règlement local                         | Places ½-temps selon besoins                               | Municipal           |

Les crèches municipales sont financées par la collectivité et la CAF, **le tarif familial est fixé au quotient familial**. Par exemple, la Ville de Paris applique un forfait mensuel par enfant en fonction du QF (de 2,62 € à 149,90 €/mois pour plein temps)【42†L755-L764】【42†L765-L774】. Ce tarif forfaitaire unique couvre le service (hors restauration). Les repas sont assurés par la Caisse des écoles et facturés séparément selon le QF【42†L755-L764】【42†L765-L774】. Il peut y avoir un dépôt ou droit d’inscription unique. Certaines communes prévoient aussi une majoration pour garde à temps partiel ou des pénalités de retard (exemples : 1 €/minute après l’horaire, non légal mais appliqué par certaines garderies municipales). Les familles paient ce « tarif de service »\* ; la différence est financée par subventions (CAF PAJE/PSU et collectivités).

_(Le tarif CHF de crèche financé ne correspond pas à un prix de marché : c’est un barème social national【39†L63-L71】. Par exemple, au-delà d’un plafond de ressources, le tarif horaire est limité à 5,26 €/h pour les EAJE conventionnés【39†L63-L71】.)_

**Inputs (parent)**

- Quotient familial (€/mois), nombre d’heures d’accueil (h/mois)
- Nombre de repas pris au relais/crèche (repas déjeuners)
- Fréquence d’accueil (temps plein/partiel)

**Defaults**: barème CAF national (quotient) – les seuils QF sont paramétrables par commune.  
**Derived**: `tarif_forfait = barème(QF, nb_enfants, nb_heures)` ; `cout_mensuel = tarif_forfait × heures_mois`.

## Mode — Crèche privée

| Composante                  | Souvent présente ? | Fixée par                    | Exemple chiffré                             | Source type    |
| --------------------------- | ------------------ | ---------------------------- | ------------------------------------------- | -------------- |
| **Tarif de garde**          | Yes                | Gestionnaire / contrat       | Taux horaire unique ≲10 €/h【47†L269-L272】 | Prestataire    |
| **Frais d’inscription**     | Parfois            | Établissement                | ex. 100–200 € (inscription)                 | Crèche (ex.)   |
| **Repas / couches**         | Oui                | Privé (inclus ou supplément) | Souvent inclus (ex. repas)                  | Contrat crèche |
| **Cotisations (structure)** | – (incluses)       | –                            | –                                           | –              |
| **Heures supplémentaires**  | Non (pas de 8h/j)  | –                            | N/A                                         | –              |

Les crèches privées (associatives ou commerciale) fixent **librement leurs tarifs** en fonction de leur coût de revient. Lorsque la crèche est conventionnée CAF, le tarif horaire de la place fait l’objet d’une **barémisation CAF (PSU)**. Sinon, la crèche propose un tarif commercial par jour ou par heure, sans dépasser 10 €/h pour que la famille reste éligible au CMG via PAJE【47†L269-L272】. En pratique, on voit des tarifs forfaitaires mensuels ou jours (exemple : 25 € par jour de présence). Les frais d’inscription peuvent être exigés (ex. 1 mois de dépôt). Les repas, couches et activités sont souvent inclus dans le tarif (ou facturés selon forfait interne). Les cotisations sociales du personnel sont couvertes par le prix de la place (non décomptées de la facture des parents). Aucun barème national contraignant ne fixe le tarif fixe excepté cette limite de 10€/h pour les aides CAF【47†L269-L272】.

**Inputs (parent)**

- Tarif horaire ou journalier (€), nombre d’heures ou jours par mois
- Frais d’inscription (€/enfant, unique)
- Repas fournis (oui/non)

**Defaults**: plafond 10 €/h si éligible PAJE (CMG).  
**Derived**: `cout_mensuel = tarif × h_mensuelles`.

## Mode — Crèche inter-entreprises

| Composante                    | Souvent présente ? | Fixée par                            | Exemple chiffré                                 | Source type        |
| ----------------------------- | ------------------ | ------------------------------------ | ----------------------------------------------- | ------------------ |
| **Tarif salarié**             | Yes                | Barème CAF national (PSU)            | Même barème que municipal (CAF)【66†L268-L276】 | Service public CAF |
| **Participation employeur**   | Yes (subvention)   | Politique d’entreprise, négociations | Variable (p.ex. 50–75% du coût)                 | Convention interne |
| **Coût pour famille (reste)** | Yes                | Barème CAF / QF                      | cf. barème CAF【66†L268-L276】                  | Service public CAF |
| **Frais d’inscription**       | Parfois            | Gestionnaire                         | ex. dépôt adhésion (selon creche)               | Crèche/entreprise  |
| **Repas & sorties**           | Oui (comme privé)  | Selon contrat entre parents/crèche   | Inclus dans le tarif (ex.)                      | Crèche interne     |

Les crèches inter-entreprises (ou crèches d’entreprise ouvertes à plusieurs employeurs) fonctionnent comme des crèches privées subventionnées par l’employeur. **Le tarif horaire appliqué aux parents suit en général le barème national (PSU) déterminé par la CAF**【66†L268-L276】, identique à celui des crèches municipales. Autrement dit, la part famille est calculée selon quotient familial comme ci-dessus. L’entreprise (ou groupement) finance le reste du coût (via aides fiscales, CIF etc.); la participation patronale dépend de la politique interne (souvent 50–75 % du coût total). Le gestionnaire de la crèche fixe le tarif de base (par ex. coût réel de la place), puis, par convention CAF, une partie est versée à la crèche (PSU) et le solde est couvert par l’employeur. Aucun texte précis ne normalise ce partage ; il est établi par accord employeur/gestionnaire. Les familles paient donc en pratique un tarif “municipalisé” (calcul CAF) ou un forfait horaire défini, diminué du financement patronal.

**Inputs (parent)**

- Nombre d’heures d’accueil (h/mois) par enfant
- Quotient familial ou ressources (pour barème CAF)
- Taux de prise en charge employeur (%)

**Defaults**: barème CAF (quotient), employeur = 50%.  
**Derived**: `tarif_par_famille = barème_CAF(QF) × heures`; `reste_à_charge = tarif_par_famille × (1 - taux_patrimonial_employeur)`.

## Cross-cutting: cotisations & déclarations

- **URSSAF/Pajemploi** s’appliquent à tous les modes employant du personnel (nounou, assistante maternelle). Les particuliers employeurs calculent cotisations via _Pajemploi_ (Urssaf), qui automatise bulletins et déclarations【68†L371-L379】. L’adhésion Pajemploi est obligatoire pour les gardes d’enfants à domicile (y compris partagées) et pour les assistantes maternelles. Ces services prélèvent les charges patronales et salariales (contribution famille, maladie, vieillesse, etc.), versées à l’URSSAF.
- **CESU préfinancé** reste possible pour la garde à domicile, mais ne couvre pas les assistantes maternelles ni ne gère la garde partagée (Pajemploi exclusif pour garde partagée【68†L371-L379】).
- **Autres obligations** : en EAJE (crèches) le gestionnaire déclare son personnel via DSN comme tout employeur. Les bases des salaires et cotisations (SMIC, taux Urssaf, plafond heures sup) sont communes. Voir DR-03 pour détails complets sur les taux de cotisation et calculs de paie. Les aides CAF (CMG) et impôt (crédit d’impôt) ne sont pas des coûts mais réduire le _reste à charge_ (traités dans DR-01/02).

## Unknowns & parameters the app cannot hardcode

- **Local tariffs and barèmes**: Municipales (quotient familial) varient par commune/CAF ; les seuils QF et tarifs (horizon 2026) sont paramétrables.
- **Salaire négocié**: Le logiciel ne fixe pas le salaire, il doit être fourni (≥ SMIC). Les conventions collectives évoluent chaque année (SMIC, minima CCN).
- **Nombre de familles/partage**: Pour garde partagée, le mode de partage (50/50 ou prorata) est libre ; l’appli doit demander la répartition choisie.
- **Participation employeur crèche**: Pour crèches entreprise, l’employeur peut couvrir une partie variable du coût ; c’est un paramètre projet (noté en DR-03).
- **Repas/transport**: Certains frais (repas supplémentaires, sorties, fournitures) dépendent du contrat/famille ; on ne peut présumer leur montant.
- **Niveau d’accueil**: Horaires pratiques (demi-journées, jours fériés) relèvent de chaque contrat/établissement, pas codés.
- **Tarifs privés indicatifs**: Les montants de crèches privées ou nounous du marché peuvent varier largement : les plages communiquées doivent être considérées comme indicatives (pas de valeur légale).

## Source index

- SMIC, cotisations, CIDs : InfoGouv (SMIC 2026)【6†L89-L94】; URSSAF/Pajemploi (charges sociales).
- Services à la personne / CCN (nounou, assmat) : Particuliers employeurs (CCN 3239)【68†L235-L243】【68†L371-L379】, Code travail numérique.
- Assistantes maternelles : Service-Public (simulateur indemnités)【62†L93-L100】.
- Crèches publiques : exemples mairie Paris (tarifs QF 2026)【42†L755-L764】【42†L765-L774】.
- CAF / PUIs : Barème familial CAF (PSU plafonds)【39†L63-L71】.
- Crèches privées / garde à domicile : guides professionnels (Babilou, UNAF, Particulier-Employeur)【47†L269-L272】【68†L235-L243】 for illustrative rates.
- Crèches entreprise/inter-entreprises : CAF “mode de garde” docs and LPCR guide【66†L268-L276】 for financing.
