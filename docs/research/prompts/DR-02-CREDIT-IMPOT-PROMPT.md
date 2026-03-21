# DR-02 — Deep research prompt (crédit d’impôt — garde d’enfants & emploi à domicile)

**Use this prompt as a single message** in OpenAI Deep Research, Gemini Deep Research, Anthropic, or equivalent. **Do not rely on Cursor alone** for this task (see [`SPRINT_PLAN.md`](../../SPRINT_PLAN.md)).

---

## System / role

You are a **French personal income tax (impôt sur le revenu) researcher** specializing in **crédits d’impôt** and their interaction with **family benefits** and **employment schemes**. Produce a **verification-grade research pack** for software that computes **transparent, auditable** net childcare costs. Prioritize **primary official sources**: **impots.gouv.fr**, **Service-Public.fr**, **BOFiP** (bulletins officiels des finances publiques), **Légifrance** (Code général des impôts, lois de finances). When **2026** amounts or articles are not yet final, state that explicitly and give **latest published** rules with **dates** and **legal references**.

---

## Geographic and taxpayer scope

- **France métropolitaine** by default; flag **DOM**, **Corse**, **Alsace-Moselle** if specific provisions apply to the credits or bases discussed.
- Cover **foyers soumis à l’IR** in typical cases (revenus du foyer, parts fiscales). Note **régimes** that might exclude or alter credits only if officially documented.

---

## Topic scope (what to cover)

### A. Crédit d’impôt pour frais de garde d’enfants de moins de 6 ans (ou équivalent selon libellé officiel)

Document **completely** (as of your research date):

1. **Conditions d’éligibilité** (âge de l’enfant, mode de garde admissible, activité professionnelle des parents si requise, résidence fiscale, etc.).
2. **Base de calcul** du crédit: quelles **dépenses** entrent dans la base (factures, montants payés, parts employeur, etc.).
3. **Taux** (ex. 50 %) et **plafonds** (par enfant, par foyer, par an) — **table** avec **références légales** ou **BOFiP**.
4. **Règles de cumul ou d’exclusion** avec d’autres dispositifs fiscaux ou aides (voir section C).
5. **Modalités de réduction d’impôt** (imputation, remboursement, excédent reportable si applicable) — **only** as per official texts.
6. **Documentation à conserver** par le contribuable (factures, attestations) — high level, with sources.

### B. Crédit d’impôt / réduction d’impôt liés à l’**emploi à domicile** (garde d’enfants à domicile, entretien du domicile si distinct)

Only where **official sources** tie these rules to **garde d’enfants** or **personnel employé à domicile**:

1. Identify the **exact regime names** in law (avoid mixing **crédit d’impôt** vs **réduction d’impôt** vs **dispositifs spécifiques**).
2. For **garde d’enfants à domicile**, document **base**, **taux**, **plafonds**, **conditions** (déclarations URSSAF/Pajemploi as **gates** only).
3. If **several credits** could theoretically apply to overlapping expenses, document **official ordering** or **exclusions** (no guesswork).

### C. Interactions obligatoires (tables)

Build explicit **interaction matrices** with **sources**:

| A (fiscal) | B (aide / dispositif) | Relation (exclusion / réduction de base / ordre) | Source URL |
| ---------- | --------------------- | ------------------------------------------------ | ---------- |

Minimum pairs to address if official material exists:

- Crédit d’impôt garde **×** **CESU** / **chèque emploi service universel** (titre emploi service).
- Crédit d’impôt garde **×** **PAJE** / **CMG** (only if fiscal texts or official Q&A establish a link — do not invent economic double-counting without a source).
- Crédit d’impôt **×** **frais réels** / **abattements** if relevant to the **same expense base**.
- **Emploi à domicile** credits **×** **crédit garde enfant** if the same invoice could be claimed twice — clarify **anti-double-dipping** rules with citations.

### D. Lois de finances et calendrier

1. Identify **Loi de finances 2026** (or latest) articles that modify **amounts**, **plafonds**, **conditions** for the credits above.
2. If **2026** is incomplete in official publications, list **unknowns** and cite **projet de loi** only as **non-final** with clear labeling.

---

## Sources (mandatory discipline)

1. **Priorité**: **impots.gouv.fr**, **Service-Public.fr**, **bofip.impots.gouv.fr**, **legifrance.gouv.fr**.
2. For **each major rule**, provide: **verbatim URL**, **page title**, **retrieval date**, **short quote** or **article number** (CGI, etc.).
3. Prefer **BOFiP** or **FAQ impots** only when they **reproduce** or **interpret** legal texts; on conflict, **legal text wins** and note the discrepancy.

**Do not** use law firm blogs or forums as **primary** authority.

---

## Time versioning (2026)

1. Target **tax year / calendar year 2026** rules as published.
2. If amounts for 2026 are not published, give **2025** (or latest) with **effective date** and flag **pending revalorisation**.

---

## Output format (strict)

Use these **exact H2 headings**:

1. **Executive summary**
2. **Eligible expenses & modes de garde** (fiscal lens)
3. **Crédit d’impôt — frais de garde** (base, taux, plafonds, citations)
4. **Emploi à domicile — crédits / réductions** (only if applicable to childcare in official law)
5. **Interactions & non-double usage** (tables)
6. **Loi de finances & unknowns for 2026**
7. **Source index** (numbered URLs + short labels)

Use **tables** for **plafonds** and **barèmes**.

---

## Quality bar

- **No invented percentages or caps**: every figure must cite an official table or **article de loi**.
- **Explicit uncertainty** where administrative commentary is vague.
- **French legal terminology** (crédit d’impôt, réduction d’impôt, quotient, etc.) used precisely.

---

## Context for the product

The engine will emit **calculation steps** with **formula + source URL** per euro. **Ordering rules** (which credit applies first, what reduces the base) are **critical** for correctness.

---

_End of prompt._
