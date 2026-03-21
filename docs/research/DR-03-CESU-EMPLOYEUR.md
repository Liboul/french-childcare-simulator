# Executive summary

In France, **CESU (Chèque Emploi Service Universel)** is a simplified payroll/declaration system for domestic help (including in-home childcare)【21†L198-L201】. A _déclaratif_ CESU lets a private employer declare and pay a household employee; it covers approved activities (housekeeping, senior care, childminding, etc.)【21†L192-L201】. CESU **préf**inancé is a prepaid voucher (usually employer-funded) to pay for services. Both incur normal social contributions (roughly ~22 % employee + ~42 % employer of gross wages【86†L318-L326】), with **no special exemption** for standard users (the 15-point employer rebate was abolished in 2011【58†L365-L373】). Only specific cases (employer ≥70 years, disabled child) give partial payroll-tax breaks【70†L278-L286】【65†L147-L154】. For the employer, CESU payments (wages+contributions) are an expense with a 50 % income-tax credit on wages+Social charges up to €12 000/year (plus standard majorations)【19†L372-L380】【83†L116-L124】. Pre-financed CESU paid by the employer counts as a _CAF-like aide_ (reported in tax case 7DR) and does **not** itself generate a tax credit【83†L121-L124】. All CESU “salary” must appear on the URSSAF annual attestation (for tax/CAF)【83†L163-L170】.

**Titres-services** (historical CES/TES schemes) have been superseded by CESU or TESE. The _Chèque-Emploi-Associatif (CEA)_ is a distinct system for non-profit employers, not typically used by private families【89†L158-L166】. Employers offering **childcare benefits** (e.g. creches, nurseries, subsidies) can deduct these costs as business expenses and, under rules, the first **€1 830 per child per year** is exempt from payroll tax (court ruling【101†L243-L251】). Excess contributions above €1 830 create a taxable fringe benefit for the employee【101†L243-L251】. National law has no uniform scheme for local crèche support (plans vary), so any employer subsidy beyond that limit is treated case-by-case (often offset by tax credits like the “crédit d’impôt famille”【98†L276-L284】).

**Cost modeling:** For each scenario (wages, hours, benefits, subsidies), one must hold constant either the **gross employer cost** or base wage and compute net pay + credits. Key inputs include gross salary, hours, children’s needs, employer subsidy amounts, CAF/APA status, etc. Outputs include the employee’s net pay and tax credit, the employer’s total cost (wage + employer charges – any credit), and the base of expenditure eligible for the 50 % tax credit. In all cases, do **not** double-count items: e.g. CAF (CMG) aid excludes use of CESU for the same childcare【21†L198-L201】, and an employer’s in-kind childcare help under €1 830 isn’t taxed.

# CESU / _titre emploi service_

- **What it is:** CESU is a unified system for declaring and paying a domestic worker. In the _déclaratif_ mode, a household employer declares the employee’s gross pay and the URSSAF computes contributions【21†L192-L201】. CESU préfinancé (voucher) is simply a form of payment; wages must still be declared normally. (The older _chèque emploi service_ and _titre-emploi service_ schemes have been replaced by CESU or TESE.) The employer must be a private individual (not via an employment agency); activities must be approved “services à la personne” (including at-home childminding)【21†L192-L201】.

- **Social contributions:** Employee payroll taxes (CSG, secu, retraite, chomage, etc.) are standard (~22 % of gross【86†L318-L326】). Employer contributions (assurance vieillesse, chômage, AT/MP, formation…) are also standard (~42 % of gross【86†L318-L326】). No special low rate applies: the previous 15-point credit for household employers was **eliminated** in 2011【58†L365-L373】. Only special conditions yield relief: e.g. employers ≥70 years get partial exemption on up to €781.30/mo of wages【70†L278-L286】, with the first €1 830/yr per employee exempt from payroll tax【101†L243-L251】. In general all contributions must be paid via URSSAF/Cesu.

- **Fiscal (employer tax):** A private employer (parent) may deduct the domestic wages as professional expenses, but more importantly benefits from the 50 % **income-tax credit** on all _employment of a home worker_ expenses (salaires+cotisations)【19†L372-L380】【83†L116-L124】. The credit covers up to €12 000 of spending per year (plus +€1 500 per child/person, capped at €15 000 total)【19†L372-L380】【83†L126-L134】; first-year and disability exceptions allow higher ceilings【19†L376-L380】【83†L133-L142】. The employer declares total wages paid in tax form (case 7DB) and any public aid (CAF/MSA/Préfinancé CESU) in case 7DR【83†L118-L124】. _Employee side:_ Wages are taxable income as normal. If the employer provides any in-kind childcare (e.g. on-site crèche slot) above €1 830/yr, that excess is a taxable benefit【101†L243-L251】.

- **Plafonds & records:** The credit base is limited as above (€12 000 base + €1 500 child). The URSSAF/Cesu system requires annual attestations of wages and contributions【83†L163-L170】. Employers must keep contracts, pay slips and URSSAF statements for at least 3 years to substantiate claims【83†L163-L170】.

- **Non-cumul:** A parent cannot use CESU déclaratif _and_ receive CAF child-care (CMG) simultaneously for the same children【21†L198-L201】. CESU préfinancé from an employer is treated as public aid (reported in case 7DR)【83†L118-L124】. The 50 % tax credit for direct home employment does _not_ stack with external “frais de garde” credit (mutually exclusive schemes).

- **Mini-algorithm:** Given gross wage _W_, hours _H_, employer subsidy _S_, etc:
  1. Compute **net salary** = _W_ − (employee cotisations ≈0.22\*W)【86†L318-L326】.
  2. Employer cost = _W_ + (employer cotisations ≈0.42*W)【86†L318-L326】 − (any subsidy S added by employer) + (employer CESU voucher * value\*).
  3. Tax credit base = _W_ + employer cotisations. Credit = 50% of that, limited by €[plafond, see above].
  4. Subtract any public aid or préfinancé CESU from base (per impôt instructions)【83†L118-L124】.
  5. **Do not double count**: If using CESU déclaratif, do not include CAF/CMG (disallowed)【21†L198-L201】. The employer subsidy (S) that is fully CESU-funded yields no additional tax credit for the family【83†L121-L124】.

# Titres-services & autres titres

“Titres-services” in France refers historically to voucher schemes for domestic help. The **old Chèque Emploi Service (CES)** and **Titre Emploi Service (TES)** (1990s) were replaced by the CESU system in 2006【85†L1-L4】. Today, only CESU (and the enterprise TESE platform) are current. If a family is paid via any voucher (restaurant-like vouchers) that are redeemable for services, those function like _CESU préfinancé_ and follow the same rules. There is no separate modern “titre-service” beyond what CESU covers.

Other “titles” (non-cash benefits) are not directly involved in domestic childcare. For example, some organizations issue service vouchers, but their use for childcare still must comply with CESU declaration. **Deprecated:** Names like “CES-PASS emploi” no longer apply (replaced by CESU).

# Chèque-emploi associatif

The _Chèque Emploi Associatif (CEA)_ is a simplified payroll service for non-profit employers【89†L158-L166】. It allows small associations/foundations to handle DPAE, contracts, and cotisations in a single bulletin. **Scope:** Only non-profits may use it; agricultural (MSA) and certain insertion structures cannot【89†L158-L166】. CEA is purely an employer tool — it does _not_ directly affect family out-of-pocket childcare costs. In other words, parents in associations still pay their employee normally; CEA just simplifies the association’s admin. There is no special credit or fee change for the family via CEA beyond the usual tax credit for domestic help.

# Avantages employeur & crèches d’entreprise

Employer-sponsored childcare (on-site crèches, inter-company nurseries, or subsidies to external care) is largely **local/contractual**: no single national rate applies. Generally:

- **Tax treatment:** Employer contributions to childcare are _deductible_ business expenses. They are not taxed to the employer. For employees, any part of that help beyond €1 830/year per child is a taxable benefit【101†L243-L251】 (the first €1 830 is exempt from payroll tax). There is **no national payroll tax credit** akin to the family credit; however, businesses (subject to real tax regimes) may claim 50 % of such expenses under the “crédit d’impôt famille” for creches【98†L276-L284】. (This applies if the company runs or contributes to a crèche for its staff’s children; small businesses and solo entrepreneurs are excluded.)

- **Social charges:** Contributions to employees’ childcare are generally _excluded_ from social bases up to certain amounts (the 1 830 € rule above). Beyond that threshold, as court rulings say, the excess is treated as fringe benefit subject to the usual cotisations【101†L243-L251】. There is no forfait social on these payments if they remain below the exempt limit.

- **Local vs national:** Many corporations run inter-company nurseries or agreements with local crèches. Those are negotiated locally; the only national rule is that subventions are deductible. Parameters like subsidy percentage or fee-sharing are user inputs. For example, a software should allow specifying “percentage of crèche fee paid by employer” or a fixed cap per child.

- **Example:** If employer pays €2 000/yr for an employee’s crèche spot, then €1 830 is non-taxable. The remaining €170 is a taxable benefit on which both employer and employee contributions apply【101†L243-L251】. No separate employer tax credit or payroll exemption beyond this is given by statute.

# Interaction matrices (with URLs)

| Interaction                                                          | Effect / Rule (with source)                                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CESU (déclaratif)** vs **50 % Crédit d’impôt (emploi à domicile)** | The wages declared via CESU fully qualify for the 50 % “emploi d’un salarié à domicile” credit (subject to the €12 000+ limits)【19†L372-L380】【83†L116-L124】. Income paid through CESU contributes to the tax base.                                                                 |
| **CESU préfinancé (employer-funded)** vs **Crédit d’impôt**          | If an employer finances CESU vouchers 100%, those amounts are treated as public aid in taxation (entered in Form 7DR) and do _not_ generate a new tax credit【83†L121-L124】. (Essentially, the employee receives a benefit but the family’s tax credit base is reduced by that aide.) |
| **CESU** vs **CAF aide (CMG)**                                       | _Non-cumul:_ A CESU déclaratif cannot be used for childcare if the family already receives CAF/MSA assistance for that care【21†L198-L201】. If using CESU, CAF child-care aid is disallowed.                                                                                          |
| **Employer crèche aid (≤€1830)** vs **Imposable**                    | Employer’s subsidy up to €1 830/yr per child is _not_ a taxable benefit【101†L243-L251】.                                                                                                                                                                                              |
| **Employer crèche aid ( >€1830)** vs **Imposable**                   | The portion **above €1 830** per year/child is a fringe benefit included in the employee’s income【101†L243-L251】.                                                                                                                                                                    |

In all cases, official sources (URSSAF, impots.gouv.fr) and jurisprudence define these gates【21†L198-L201】【101†L243-L251】. (If a condition isn’t explicitly covered by national law, we note it as a configurable parameter below.)

# Parameters for a configurable calculator

Key **user-inputs** vs fixed law parameters:

- **Gross wage & hours**: The employee’s hourly/brut wage and total hours worked (fixed by contract).
- **Childcare activity**: Whether employment qualifies as “services à la personne” (e.g. in-home childminding) as per CESU rules【21†L192-L201】.
- **Employer age/handicap status**: Whether the employer or spouse is ≥70 or has a disabled child<20 (since only these trigger partial cotisation exemptions)【70†L278-L286】.
- **Employer subsidy amounts**: Any monetary help for childcare (e.g. crèche fees, CESU préfinancé from employer).
- **CAF/MSA aid**: Whether family receives public childcare aid (blocks CESU use by law【21†L198-L201】).
- **Credit options**: Choice to take advance of tax credit or pay normally (CESU+ simplifies the process).
- **Timeframe**: Calendar year (affecting which brackets and limits apply).

For scenario comparisons (e.g. CESU vs no-CESU), one **base variable should be held constant** – typically the **total employer cost** or base wage – so differences isolate the instrument’s effect. For example, to compare CESU vs payroll, fix the gross wage; the software then adds contributions, calculates net pay and credit, and contrasts scenarios.

All statutory thresholds (credit ceilings, €1 830 advantage limit, contribution rates) are **law-fixed** (but updated annually). Optional parameters include any additional local subsidies or children’s ages beyond national rules.

# Unknowns & follow-ups

- **Current contribution rates:** Official URSSAF tables for 2026 “salarié à domicile” rates could not be retrieved (site yields bad gateway). We rely on known approximations【86†L318-L326】. Exact percentages for 2026 should be confirmed once URSSAF publishes updated barèmes.
- **Titres-service specifics:** We did not find distinct modern “titre-services” beyond CESU. If such schemes arise, their rules must be integrated.
- **Local creche arrangements:** No single national rule governs employer creche subsidies beyond the €1 830 exemption【101†L243-L251】. Details (e.g. plafond per child, split rules) vary and should be input by users.
- **Calculator assumptions:** The package assumes taxation and social rules as stated; any future law changes (post-2026) require updates. Some edges (e.g. combined employer/CAF interactions) have to be treated by logic gates in the software, based on the cited rules【21†L198-L201】【101†L243-L251】.
- **Follow-up:** Verify all rate updates on URSSAF/impots.fr for 2026, and confirm no new instruments have emerged. Monitor if URSSAF restores public access to its 2026 barème pages (they are currently inaccessible).

# Source index

- Service-Public.fr – _Particulier employeur : à quoi sert le CESU déclaratif ?_ (garde d’enfants exclue si CAF)【21†L192-L201】.
- Service-Public.fr – _Emploi à domicile : exonérations pour employeurs >=70 ans et situations_ (détail plafonds de 1 830 €/an)【70†L278-L286】.
- Service-Public.fr – _Emploi à domicile : exonérations des cotisations_ (exonérations 70+, handicap, etc.)【70†L278-L286】.
- Service-Public.fr – _Chèque-emploi associatif (CEA)_ (associations eligible)【89†L158-L166】.
- Impots.gouv.fr – _Emploi à domicile_ (calcul et plafonds du crédit d’impôt 50 %)【83†L116-L124】【83†L126-L134】.
- BOFiP (Impots.gouv.fr) – IR _Réduction/crédit emploi domicile_ (confirm 50%, plafonds, majorations)【19†L372-L380】.
- Service-Public.fr – _Impôt sur le revenu : crédit d’impôt pour emploi d’un salarié à domicile_ (declaration cases)【83†L161-L170】.
- **Jurisprudence** (via Légisocial) – _Cour de cassation 2019_ (avantage en nature crèche pour >1 830 €/an)【101†L243-L251】.
