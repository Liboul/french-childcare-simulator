# DR-01 — Deep research prompt (CMG & prestations CAF liées aux modes de garde)

**Use this prompt as a single message** in OpenAI Deep Research, Gemini Deep Research, Anthropic, or equivalent. **Do not rely on Cursor alone** for this task (see [`SPRINT_PLAN.md`](../../SPRINT_PLAN.md)).

---

## System / role

You are a **French social protection and family benefits researcher**. Your job is to produce a **verification-grade research pack** for software that compares **real net childcare costs** in France. You must prioritize **primary official sources** (CAF, Service-Public, Légifrance, Décret/Arrêté when needed). When a figure is **not** published for **2026**, say so explicitly and give the **latest official figure with its publication date** and the **legal basis** for revalorisation.

---

## Geographic and legal scope

- **France métropolitaine** by default; if rules differ for **DOM**, **Corse**, or **régime Alsace-Moselle**, call that out in a dedicated subsection.
- Focus on **allocataires** du **régime général** via **CAF** / **MSA** as relevant (if MSA-specific rules exist for the same benefits, document them briefly with sources).

---

## Topic scope (what to cover)

### A. Complément de mode de garde (CMG)

For **each** of the following **types de mode de garde** (map CAF terminology to these product categories where needed):

1. **Garde à domicile** (emploi direct d’une garde d’enfants à domicile — incl. salarié, parfois « nounou » dans le langage courant).
2. **Assistante maternelle** (accueil chez l’assistante maternelle).
3. **MAM** (maison d’assistantes maternelles).
4. **Établissement d’accueil du jeune enfant** when relevant for the CMG: **crèche collective**, **crèche familiale**, **halte-garderie**, **jardin d’enfants** (only if CMG applies — if not, state it clearly).

Also address how the product modes below map to CAF categories (explicit mapping table):

- **Nounou à domicile** → which CAF type(s).
- **Nounou partagée** → how CAF treats shared care / multiple employers / répartition des heures (if documented).
- **Crèche publique** vs **crèche privée** vs **crèche inter-entreprises** → same CMG branch or different parameters (tarifs are often local, but **CMG rules** must be national — separate **tarif** from **aide**).

For **each** applicable mode, document:

1. **Conditions d’ouverture du droit** (âge de l’enfant, activité professionnelle des parents, cohabitation, garde effective, etc.).
2. **Conditions liées à l’emploi / au contrat** (déclaration URSSAF/Pajemploi, enregistrement, agrément, etc.) **only insofar as they gate the CMG** (deep URSSAF employment rules are out of scope except as **gates** to the benefit).
3. **Montant du CMG**:
   - **Barème** structure (tranches de ressources, quotient familial, nombre d’enfants à charge, etc.).
   - **Planchers / plafonds** et toute **réduction** liée aux ressources.
   - **Fréquence de versement** (mensuel, etc.) et **base de calcul** (heures, jours, forfait).
4. **Ce qui est exclu** ou **réduit** le droit (ex. revenus trop élevés, non-respect des délais de demande, etc.).
5. **Délais et démarches**: délais de demande rétroactifs si d’actualité, pièces justificatives **au niveau CAF** (high level).

### B. Autres prestations CAF **directement liées** au même périmètre (inclure si pertinent)

Only if they interact with **CMG** or are commonly confused with it:

- **Prestation d’accueil du jeune enfant (PAJE)** — **complément de libre choix du mode de garde** vs autres composantes: **clarify non-cumul** and **order of application** if official sources describe it.
- **Aides au logement** (CAF): state whether **non-cumul** or **ressources** interactions are documented **with CMG** (only if official sources establish a link; do not speculate).
- Any **« complément »** or **« allocation »** with a similar name that users or portals conflate with CMG — **disambiguate** with sources.

### C. Non-cumul, ressources et ordre d’imputation

Produce **three** explicit artifacts:

1. **Table de non-cumul** (prestation A × prestation B × source URL).
2. **Règles de prise en compte des ressources** for CMG (what income concept: N-1, N-2, revenus courants, etc.) **as stated by CAF/Service-Public**.
3. **Effet sur le montant** when plusieurs enfants / plusieurs modes simultanés (si documenté).

---

## Sources (mandatory discipline)

1. **Priorité**: **caf.fr**, **service-public.fr**, **legifrance.gouv.fr** (textes), and **msa.fr** if MSA is in scope.
2. For **each major rule** (eligibility, amount, non-cumul), provide:
   - **Verbatim page URL** (stable page if possible),
   - **Title of the page**,
   - **Retrieval date** (your run date),
   - **Short verbatim quote** (1–3 sentences max) or **exact article references** when using Légifrance.
3. If sources **conflict** (rare but possible between summary pages and texts), **prefer the legal text** and explain the discrepancy.

**Do not** use blogs, forums, or law firm marketing pages as **primary** authority. You may mention them only as **“non-official summary”** if needed, clearly labeled.

---

## Time versioning (2026)

1. Target **year 2026** for all **amounts** and **thresholds**.
2. If **2026** is **not fully published** at research time:
   - Provide **latest official** figures with **effective date**,
   - List **what is still unknown** for 2026,
   - Describe **how revalorisation usually works** **only** if explicitly documented (otherwise: unknown).

---

## Output format (strict)

Return a **single structured document** with the following headings (use these exact H2s):

1. **Executive summary** (10–15 lines max).
2. **Mode mapping** (product categories → CAF categories).
3. **CMG — Garde à domicile** (subsections: eligibility, amount/brackets, cumul, sources).
4. **CMG — Assistante maternelle**.
5. **CMG — MAM**.
6. **CMG — Établissements / crèche / halte-garderie** (split by type if rules differ).
7. **Nounou partagée & cas particuliers** (only official material).
8. **Non-cumul & interactions** (tables).
9. **Unknowns & follow-ups** (bullet list of what could not be verified officially).
10. **Source index** (numbered list of all URLs with 5-word labels).

Use **tables** for **barèmes** (ressources → montant) wherever possible.

---

## Quality bar

- **No invented amounts**: if you give a number, it must be **traceable** to an official table or legal text **with citation**.
- **Explicit uncertainty**: when a portal uses vague wording, quote it and flag **ambiguity**.
- **French benefit names**: use official terminology (accents, acronyms) and define acronyms once.

---

## Context for the product (do not research outside this)

This research feeds a **calculator** that outputs **net cost**, **remaining out-of-pocket**, and **transparent calculation steps**. Your pack will be turned into **JSON config** and **citations** per step — **precision on non-cumul and brackets** matters more than narrative length.

---

_End of prompt._
