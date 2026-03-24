# DR-06 — Deep research prompt (coûts complémentaires emploi à domicile — garde d’enfants)

**Use this prompt as a single message** in OpenAI Deep Research, Gemini Deep Research, Anthropic, or equivalent. **Do not rely on Cursor alone** for this task (see [`SPRINT_PLAN.md`](../../SPRINT_PLAN.md)).  
**Supports:** [`GARDE-034`](../stories/GARDE-034.md) (moteur + assiettes CMG / crédit d’impôt). Complement to [`DR-04`](../DR-04-COUT-MODES.md) (composantes courantes) and conceptually linked to **DR-01** (CMG), **DR-02** (crédit d’impôt), **DR-03** (Pajemploi / cotisations).

---

## System / role

You are a **French employment law, social protection, and tax documentation researcher** (not a lawyer or tax advisor). Your job is **not** to compute a household’s payroll, but to produce a **verification-oriented research pack** for **software** that compares **net childcare costs** when the parent employs a **garde d’enfants à domicile** (often called « nounou ») or equivalent **emploi direct à domicile** covered by **Pajemploi** / **URSSAF**.

Focus on **cost components beyond** the usual **hourly gross × hours + employer social contributions** already modeled elsewhere: **paid leave**, **sick leave / work stoppage**, **end-of-contract payments** (including **congés payés non pris**, **indemnités de rupture** where applicable), and any **recurring “hidden” employer costs** that materially affect **year-on-year** or **lifecycle** comparison with crèche / assistante maternelle.

Use **primary official sources** (Légifrance, Service-Public, URSSAF, impots.gouv, BOFiP, CAF when relevant). When practice depends on **collective agreement** or **contract**, separate **legal minima** from **CCN / usage** and cite the **text** or **official explainer**.

---

## Geographic and legal scope

- **France métropolitaine** by default. If rules differ for **DOM**, **Alsace-Moselle**, or **Mayotte**, add a short dedicated subsection with sources.
- Employment form: **salarié** du **particulier employeur** (garde d’enfants à domicile), including **co-emploi** / **garde partagée** between households when official documentation exists.

---

## Topic scope (what to cover)

### A. **Congés payés** (employer cost angle)

- **Acquisition**, **prise**, **report** — concepts only as they affect **cash out** for the employer.
- **Maintien de rémunération** during CP: what is **legally required** vs **CCN Services à la personne / particuliers employeurs** (cite current agreement ID on Légifrance or official summary).
- Whether employers typically **provision** CP in **monthly budgeting** (indicative practice — label clearly if non-legal).
- **Cotisations** on CP indemnities: high-level **URSSAF / Pajemploi** pointer (no duplicate of full DR-03 unless you cite a specific official rate page).

### B. **Arrêt maladie** (employer cost angle)

- **Subrogation IJSS**, **carence**, **maintien de salaire** by employer: **legal rules** vs **CCN** enhancements (if any).
- **Who pays what** during **arrêt** (employeur / Assurance maladie) at a level sufficient to build **scenario parameters** (e.g. “employer bears X days at full pay” — only if sourced).
- Impact on **cotisations** / **déclarations Pajemploi** at **conceptual** level (pointer to official pages).

### C. **Fin de contrat** — soldes et indemnités

Cover **categories** relevant to **cost modeling**, not procedural advice:

- **Solde de tout compte** (what it typically **includes** — definition from official sources).
- **Indemnité compensatrice de congés payés** (non-pris).
- **Indemnité légale** / **conventionnelle** de **licenciement** or other **ruptures** where **salarié à domicile** is concerned — **only** what is needed to know **whether** a lump sum exists and **what inputs** (ancienneté, salaire de référence) drive it; cite **Code du travail** articles and **CCN** if applicable.
- **Préavis** payé (as cost to employer) if legally relevant.

Explicitly flag **what cannot be modeled** without individual dossier (motif de rupture, contestation).

### D. **Co-emploi / garde partagée** (two or more employers)

- How **URSSAF / Service-Public** describes **split declarations**, **parts** of salary and hours.
- Whether **CP / maladie / fin de contrat** costs are **allocated per employer** in official guidance (or only contractual).

### E. **Interactions with public aids and tax** (critical for software)

For **each cost line** in sections A–C (and D if distinct), produce an explicit classification:

| Poste de coût (ex. indemnité CP, maintien maladie employeur, indemnité rupture) | Inclure dans « dépenses de garde » pour **CMG** (emploi direct) ? (oui / non / partiel / non documenté — expliquer) | Inclure dans **base du crédit d’impôt** « emploi à domicile » (199 sexdecies CGI) ? (oui / non / partiel / non documenté — expliquer) | Source (URL + title + access date) |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |

- Use **impots.gouv** / **BOFiP** for **crédit d’impôt**; **CAF** / **Service-Public** for **CMG** / **déclaration** rules.
- If official texts are **silent** on a specific indemnity, state **« non trouvé dans les sources primaires consultées »** and recommend **user-provided** amount + **software warning**.

### F. **Software-oriented inputs** (mandatory)

Deliver:

1. **Recommended line items** for a monthly **brut** breakdown (French labels) — which should be **user-entered** (€/mois lissé, € ponctuel, jours, etc.) vs **derived from law** (with citation).
2. **Suggested annualization** options: e.g. spread **lump-sum** end-of-contract over **N months** — **product choice**, but you must note **fiscal / aid** consistency per E.
3. **Explicit “do not hardcode”** list: parameters the app must **not** invent (ancienneté, motif, convention choice).

---

## Sources (mandatory discipline)

1. **Légifrance** — Code du travail, **convention collective** applicable (identify exact ID).
2. **Service-Public.fr** — fiches employeur / salarié garde à domicile, congés, maladie, rupture.
3. **URSSAF.fr** / **Pajemploi** — déclarations, maintiens, indemnités cotisables (conceptual).
4. **impots.gouv** + **BOFiP** — crédit d’impôt emploi à domicile, **assiette**, **exclusions**.
5. **caf.fr** / **Service-Public** — CMG emploi direct, **éléments déclarés** (heures, rémunération) if they constrain modeling.

**Do not** cite forums or law firm marketing pages as **rules of law**; you may cite them as **« pratique rapportée (non officielle) »** only if clearly labeled.

---

## Time versioning

- Prefer rules and amounts effective **2026** where published; otherwise **latest official** with **publication date** and legal basis for **revalorisation** if any.

---

## Output format (strict)

Use these **exact H2 headings**:

1. **Executive summary**
2. **Périmètre : emploi concerné** (garde d’enfants à domicile, particulier employeur, co-emploi)
3. **Congés payés — coût employeur et cotisations** (concepts + sources)
4. **Arrêt maladie — coût employeur vs sécurité sociale**
5. **Fin de contrat — soldes et indemnités** (catégories sourcées, sans conseil de procédure)
6. **Co-emploi / garde partagée** (répartition et déclarations)
7. **Tableau assiettes : CMG × crédit d’impôt × postes A–C** (matrix requested in section E)
8. **Entrées logiciel recommandées** (lignes de coût, unités, option lissage)
9. **Inconnues et limites** (ce qu’un simulateur ne peut pas figer)
10. **Source index** (numbered list, URLs complètes)

---

## Quality bar

- **Never** present **indicative market practice** as **legal obligation**.
- **Every** row in the **assiette matrix** (section E) must have **at least one** primary official reference or say **« non documenté dans les sources listées »**.
- **Cross-link** DR-01 / DR-02 / DR-03 / DR-04 **by topic** without duplicating their full content.

---

## Context for the product

The TypeScript engine already computes **monthly brut** as **salaire + cotisations patronales** for `nounou_domicile` (and shared variants). **GARDE-034** will add **optional lines** for **lifecycle / hidden** costs. Your output must tell engineers **which lines exist**, **what to ask the user**, and **whether each line belongs in CMG inputs, tax-credit base, both, or neither** — so the UI and JSON schema stay **legally transparent** and **non-cumul-safe**.

---

_End of prompt._
