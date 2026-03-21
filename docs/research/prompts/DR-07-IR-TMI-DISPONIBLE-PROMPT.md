# DR-07 — Deep research prompt (IR : TMI, barème, « revenu disponible » pour comparateur de garde)

**Supports:** [`GARDE-019`](../../stories/GARDE-019.md) — modéliser un **revenu disponible** après impôt plus réaliste que la seule saisie `baselineDisposableIncomeMonthlyEur`, **sans** refaire un simulateur IR complet.  
**Complète** [`DR-02`](../DR-02-CREDIT-IMPOT.md) (crédits d’impôt garde / emploi à domicile déjà côtés dans le moteur) : ce prompt porte sur **l’impôt sur le revenu global du foyer** (tranches, quotient, imputation des crédits) dans la mesure utile à un **outil pédagogique transparent**.

**Use this prompt as a single message** in OpenAI Deep Research, Gemini Deep Research, Anthropic, or equivalent. **Do not rely on Cursor alone** for this task (see [`SPRINT_PLAN.md`](../../SPRINT_PLAN.md)).

---

## System / role

You are a **French personal income tax (impôt sur le revenu — IR)** researcher. Produce a **verification-grade research pack** for **software engineers** who must encode a **documented, conservative** link between :

- un **revenu fiscal de référence** (ou revenu net imposable simplifié) du foyer, et
- un **taux marginal d’imposition (TMI)** ou un **modèle paramétrable** (tranches + quotient) permettant d’estimer l’effet **sur le revenu disponible** d’une variation de charges (ici : coût net de garde déjà traité CMG + crédits d’impôt dans un autre module).

Prioritize **primary official sources** : **Légifrance** (CGI, lois de finances), **BOFiP** (bofip.impots.gouv.fr), **impots.gouv.fr**, **Service-Public.fr**. When **2026** barèmes or coefficients are not final, state it explicitly and give **latest published** rules with **dates** and **legal references**.

---

## Geographic and taxpayer scope

- **France métropolitaine** by default ; signaler **DOM**, **régimes particuliers** (ex. conventions internationales, impatriés) seulement si nécessaire à la compréhension du **barème standard**.
- Foyers **soumis à l’IR** sur le revenu global ; mentionner les cas où le **prélèvement à la source** ou le **taux personnalisé** complexifie l’interprétation du « disponible mensuel ».

---

## Topic scope (what to cover)

### A. Définition opérationnelle de la **TMI** (taux marginal d’imposition)

1. Définition **officielle** ou **doctrinale BOFiP** : TMI = variation de l’IR pour une **variation marginale** du revenu imposable (ou notion équivalente retenue par l’administration).
2. Lien avec le **barème progressif** de l’IR (tranches applicables au **quotient** ou mécanisme en vigueur pour l’année visée).
3. **Ce que la TMI n’est pas** (éviter les confusions fréquentes avec le taux moyen, le taux PAS, etc.) — avec **sources**.

### B. Barème IR : **tranches**, **parts**, **quotient familial** (niveau implémentation)

1. Tableau des **tranches** et **taux** pour **revenu 2026** imposé en **2027** (ou calendrier fiscal exact selon les textes) ; si indisponible, **2025** avec date d’effet et **unknowns** clairement listés.
2. Rôle des **parts** (célibataire, marié / PACS, enfants à charge, demi-parts) au niveau **barème** — suffisant pour proposer un **jeu de paramètres** dans un fichier JSON de règles.
3. **Abattements** ou **minima** qui modifient l’assiette avant application du barème, **dans la limite** de ce qu’un comparateur « foyer type » peut raisonnablement prendre en entrée utilisateur (sans simuler toutes les cases de la déclaration).

### C. **Imputation des crédits d’impôt** (lien avec le moteur existant)

Le produit modélise déjà des **crédits d’impôt** liés à la garde (voir **DR-02**). Documenter pour les ingénieurs :

1. **Ordre** ou **règles** d’imputation des crédits d’impôt sur l’**impôt dû** vs **remboursement** (excédent, report si applicable) — **uniquement** selon textes / BOFiP.
2. Dans quelle mesure, pour estimer le **disponible après garde**, on peut raisonner en **« IR avant garde »** puis **soustraire** le coût net de garde **et** les effets fiscaux marginaux, **ou** si une autre décomposition est **exigée** par la loi (à citer).
3. Risques de **double comptage** si on applique à la fois une **TMI sur le revenu** et un **crédit d’impôt déjà calculé** sur les mêmes dépenses — **matrice** source × règle.

### D. **Prélèvement à la source (PAS)** et disponible **mensuel**

1. Ce que le PAS change (ou ne change pas) pour un **comparateur** qui affiche un **disponible mensuel** : distinction entre **trésorerie** et **IR final** après déclaration.
2. Recommandation **prudente** pour un outil **pédagogique** : quelles formulations imposer dans les **warnings** moteur (sans conseil personnalisé).

### E. Modèles **simplifiés** acceptables pour encodeur (à trancher avec sources)

Pour chaque approche ci-dessous, indiquer **fiabilité**, **limites**, et **références** :

| Approche                                                   | Description                                            | Risques | Sources minimales |
| ---------------------------------------------------------- | ------------------------------------------------------ | ------- | ----------------- |
| **TMI seule** sur revenu imposable estimé                  | Appliquer une TMI à une variation de revenu disponible | …       | …                 |
| **Barème + quotient** explicite dans le config             | Reconstruire IR approximatif puis dériver marge        | …       | …                 |
| **Forfaits / simulateur officiel** en référence uniquement | Ne pas coder ; renvoyer utilisateur vers impots.gouv   | …       | …                 |

### F. Lois de finances et **unknowns 2026**

1. Articles de **loi de finances** (ou projets) modifiant barème, parts, décote, etc. pour la **période** visée par le produit (**2026**).
2. Liste explicite des **inconnues** ou **paramètres en attente de publication** pour l’implémentation.

---

## Sources (mandatory discipline)

1. **Priorité** : **legifrance.gouv.fr**, **bofip.impots.gouv.fr**, **impots.gouv.fr**, **service-public.fr**.
2. Pour **chaque règle majeure** : **URL**, **titre**, **date de consultation**, **référence d’article** (CGI, etc.) ou extrait court.
3. En cas de **tension** entre FAQ et texte légal : **le texte légal prime** ; noter l’écart.

**Do not** use blogs d’avocats ou forums comme **autorité primaire**.

---

## Time versioning (2026)

1. Cibler les règles **année d’imposition / revenus 2026** (ou le couple d’années **revenus / imposition** exact selon le calendrier fiscal français).
2. Si les **barèmes 2026** ne sont pas publiés : donner **2025** (ou dernier publié) + **date d’effet** + section **unknowns**.

---

## Output format (strict)

Save the research pack as **`docs/research/DR-07-IR-TMI-DISPONIBLE.md`** (or attach with that suggested filename). Use these **exact H2 headings** :

1. **Executive summary**
2. **Définition TMI et distinction taux moyen / PAS**
3. **Barème IR — tranches, quotient, parts** (tableaux + citations)
4. **Crédits d’impôt déjà calculés ailleurs — imputation et cohérence avec une marge IR** (matrices / ordre)
5. **PAS vs solde annuel — implications pour un « disponible mensuel »**
6. **Modèles simplifiés recommandés pour un moteur comparatif** (avec limites et warnings obligatoires)
7. **Loi de finances & unknowns pour 2026**
8. **Source index** (liste numérotée : URL + libellé court)

Use **tables** pour **tranches**, **parts** et **interactions**.

---

## Quality bar

- **Aucun taux ou seuil inventé** : chaque chiffre cite un tableau officiel ou un article.
- **Incertitudes explicites** là où la doctrine est silencieuse sur une simplification logicielle.
- **Terminologie précise** (TMI, quotient, crédit d’impôt, décote, etc.).

---

## Context for the product

The TypeScript engine already outputs **net household burden** and optional **disposable income** from a user-supplied **baseline** (`baselineDisposableIncomeMonthlyEur`). **GARDE-019** aims to **reduce reliance on that free-text baseline** by encoding a **transparent** IR layer: parameters in **versioned JSON**, **trace steps**, and **warnings** when the model is approximate. The research must tell engineers **what may be legally modeled**, **what must stay user input**, and **what must be `todoVerify`**.

---

_End of prompt._
