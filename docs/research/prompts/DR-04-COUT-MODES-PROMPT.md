# DR-04 — Deep research prompt (modèle de coût par mode de garde — composantes & paramètres)

**Use this prompt as a single message** in OpenAI Deep Research, Gemini Deep Research, Anthropic, or equivalent. **Do not rely on Cursor alone** for this task (see [`SPRINT_PLAN.md`](../../SPRINT_PLAN.md)).

---

## System / role

You are a **French childcare economics and public-finance documentation researcher**. Your job is **not** to compute a family’s bill, but to produce a **structured cost model** for **software**: for **each mode de garde**, what **cost components** exist, which are **national/legal**, which are **local (mairie, CAF, employeur)**, and which **must be user-provided**. Use **official** or **municipal primary** sources for **examples** (e.g. a **ville** publishing 2026 tariffs). When only **private market** ranges exist, **label as indicative** and **do not** present as law.

---

## Product modes (must all be covered)

Map research to these **product categories** (from the project spec):

1. **Nounou à domicile** (emploi direct, garde au foyer du parent).
2. **Nounou partagée** (two families, one carer — or equivalent arrangements).
3. **Assistante maternelle** (accueil chez la MAM).
4. **MAM** (maison d’assistantes maternelles).
5. **Crèche publique** (collectivité / municipalité / EAJE public).
6. **Crèche privée** (hors entreprise).
7. **Crèche inter-entreprises** (berceau / crèche d’entreprise multi-employeurs).

---

## Topic scope (what to cover)

### A. For each mode: **composantes de coût**

For **each** mode above, produce a **table** with columns:

| Composante (ex. horaire, forfait, inscription, repas, sorties) | Souvent présente ? | Typiquement fixée par (loi / convention / mairie / établissement / contrat) | Exemple chiffré (optional) | Source type (URL légale / municipal / professionnel) |

Include at minimum where applicable:

- **Rémunération / salaire** (horaire, net, brut — concept only).
- **Cotisations** (employeur / employé) — **reference** URSSAF/Pajemploi without re-doing full DR-03.
- **Frais d’inscription**, **caution**, **adhésion**.
- **Repas**, **goûter**, **couches**, **sorties**.
- **Heures supplémentaires**, **pénalités** (retard) if documented as **typical contract clauses** (not legal advice — **“courant dans les contrats types”** only with **source**).

### B. National vs local vs private

1. **National**: laws or **ministère** circulars fixing **ceilings**, **agrément**, **ratios** — cite **Légifrance** or **Service-Public**.
2. **Local**: **tarifs crèche** municipale, **barème** de participation des familles — cite **site de la mairie** or **CAF** page pointing to **commune**.
3. **Private**: **fourchettes** marchandes — clearly **non-official** unless from **official statistics** (INSEE) with citation.

### C. **Nounou partagée** (deep dive)

- How **official documentation** describes **répartition des heures**, **deux employeurs**, **déclarations** — **URSSAF / Service-Public**.
- **Cost allocation** between families: what is **contractual** vs **suggested** — separate **law** from **practice**.

### D. **Crèche publique** — example **ville de Paris**

- Use **Paris** as a **worked example** only: **tarif horaire** or **barème** published for **2026** or latest **official** page (e.g. tarifs des crèches).
- Explicitly state that **other cities differ** and software must use **parameters**.

### E. **Crèche inter-entreprises**

- Document **who sets tariffs** (employer agreement, gestionnaire, convention collective) with **sources** where possible.
- **Fiscal/social** framing only at **high level**; **detail** belongs in DR-03 if overlap.

---

## Explicit **inputs** for software (mandatory section)

Deliver a **machine-oriented** subsection per mode:

- **Required user inputs** (list with units: €/h, €/mois, jours/semaine, etc.).
- **Optional defaults** (only if **official national default** exists — else `null` / user must supply).
- **Derived** values (computed from inputs — formula names only, no need to implement).

---

## Sources (mandatory discipline)

1. **Service-Public**, **CAF**, **URSSAF** for **employment-related** costs.
2. **Sites municipaux** for **public tariff examples** (name the **commune** in the URL).
3. **Légifrance** for **legal caps** affecting pricing (e.g. **tarification** EAJE) if applicable.

**Do not** present **forum posts** as fact.

---

## Time versioning

- Prefer **2026** tariffs where published; else **latest** with **date** on the page.

---

## Output format (strict)

Use these **exact H2 headings**:

1. **Executive summary**
2. **Mode — Nounou à domicile** (components + inputs)
3. **Mode — Nounou partagée**
4. **Mode — Assistante maternelle**
5. **Mode — MAM**
6. **Mode — Crèche publique** (incl. **worked example Paris** if available)
7. **Mode — Crèche privée**
8. **Mode — Crèche inter-entreprises**
9. **Cross-cutting: cotisations & déclarations** (pointers to DR-03, no duplication without cite)
10. **Unknowns & parameters the app cannot hardcode**
11. **Source index**

---

## Quality bar

- **Separate** “**tarif de service**” from “**aide CAF**” from “**crédit d’impôt**” (cross-link DR-01 / DR-02 conceptually).
- **Every example price** must have **source URL** or be labeled **hypothetical**.

---

## Context for the product

The engine’s **block B** (profil mode de garde) needs a **consistent list of line items** so **block G** can show **reste à charge** after aids and credits — your **input list** drives the **JSON schema** for scenarios.

---

_End of prompt._
