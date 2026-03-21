# DR-03 — Deep research prompt (CESU, titres-services, chèques emploi associatif, avantages employeur / berceau)

**Use this prompt as a single message** in OpenAI Deep Research, Gemini Deep Research, Anthropic, or equivalent. **Do not rely on Cursor alone** for this task (see [`SPRINT_PLAN.md`](../../SPRINT_PLAN.md)).

---

## System / role

You are a **French employment cost, social contributions, and consumer tax-instruments researcher** (URSSAF / emploi à domicile / titres-services). Produce a **verification-grade research pack** so a **calculator** can model **employer and employee-side effects** on **net childcare cost** and **taxable income**, with **traceable citations**. Primary sources: **urssaf.fr**, **service-public.fr**, **impots.gouv.fr** / **BOFiP** where fiscal, **legifrance.gouv.fr** for texts, **employer-facing official guides** (ministries, Urssaf pro) when they **mirror** primary rules.

---

## Geographic and scope

- **France**; note **DOM** or **sector-specific** schemes only with official sources.
- Focus on instruments used for **garde d’enfants** and **services à la personne** where they intersect with the product (see § Product mapping).

---

## Topic scope (what to cover)

### A. Chèque emploi service universel (CESU) / titre emploi service

1. **What it is** (employer vs employee, déclaration, agrément des activités).
2. **Social contributions** (employee / employer shares if any) — **who pays what**, **rates** at **overview level** with **official URSSAF** pages (exact rates may be in barèmes; cite tables).
3. **Fiscal treatment** for the **salarié** and the **particulier employeur** (déduction, crédit d’impôt interaction — **cross-reference** to DR-02 only with **primary fiscal sources**, not repetition without citation).
4. **Plafonds** (usage, annual limits) and **record-keeping** requirements relevant to **cost modeling**.
5. **Non-cumul** with other titles or benefits when **officially** stated.

### B. Titres-services (chèques emploi service pour titres spécifiques / dispositif historique ou successeurs)

Document **current** official regime(s). If **obsolete**, say so with **source** and point to **replacement**. Avoid obsolete names without a **“deprecated”** flag.

### C. Chèque emploi associatif (ou équivalents)

1. Scope (structures éligibles, bénéficiaires).
2. **Impact on coût pour la famille** when relevant to childcare **only if** official sources link the instrument to garde modes in scope.

### D. Dispositifs employeur: **crèche d’entreprise**, **berceau inter-entreprises**, **conventionnement** avec collectivités

1. **What is documented at national level** vs **purely contractual / local** (tarifs, subventions employeur).
2. **Fiscal treatment** of **employer participation** to childcare fees (exonérations, charges déductibles, forfait social, etc.) — **only** with **official** fiscal or social sources; if **only** accounting guidance exists, label as **non-normative**.
3. **Uncertainties** list: where **no single national rule** exists, describe **parameters** a software must take as **user inputs** (e.g. part employeur %, plafond interne).

### E. Net cost modeling (for developers)

For **each** instrument above, provide a **mini algorithm** in **plain language**:

- **Inputs** (gross wage, hours, ticket amount, employer subsidy, etc.).
- **Outputs** (net pay impact, employer cost, eligible base for fiscal credit if any).
- **What must not be double-counted** with **CMG** (DR-01) or **crédit d’impôt** (DR-02) — **only** if **official** texts or **FAQ État** establish a link.

---

## Interaction tables (mandatory)

1. **CESU × crédit d’impôt** (garde / emploi à domicile) — **sources**.
2. **Participation employeur crèche ×** revenu imposable / avantages en nature — **sources** or **“not found in primary sources”**.
3. **URSSAF déclaration** × **éligibilité aide CAF** — only **gates**, not full CMG (reference DR-01).

---

## Sources (mandatory discipline)

1. **URSSAF** service pages + **barèmes** PDFs if cited by Urssaf.
2. **Service-Public** fiches for CESU / emploi à domicile.
3. **Impots.gouv / BOFiP** for **fiscal** consequences.
4. **Légifrance** for **legal definitions** when summaries are ambiguous.

**Do not** rely on **marketplace** sites (CESU issuers) as **legal authority**; they may be cited as **“issuer FAQ”** with caution.

---

## Time versioning (2026)

- Contribution **rates** and **ceilings** often change **annually**: target **2026**; if unavailable, **latest** with **effective date** and **unknowns**.

---

## Output format (strict)

Use these **exact H2 headings**:

1. **Executive summary**
2. **CESU / titre emploi service** (social + fiscal, tables)
3. **Titres-services & autres titres** (current law)
4. **Chèque emploi associatif** (if in scope)
5. **Avantages employeur & crèches d’entreprise** (national rules + what is local)
6. **Interaction matrices** (with URLs)
7. **Parameters for a configurable calculator** (must be user inputs vs fixed by law)
8. **Unknowns & follow-ups**
9. **Source index**

---

## Quality bar

- Distinguish **cotisation** vs **impôt** vs **réduction de facture** (employer subsidy).
- **No invented URSSAF rates**: use official tables or say **unknown**.

---

## Context for the product

The spec requires **employer schemes** (CESU, berceau inter-entreprises, etc.) to be modeled **fiscally correctly** and **coût employeur constant** across compared scenarios where applicable — your pack should list **which variables** must be **held constant** vs **varied** per scenario.

---

_End of prompt._
