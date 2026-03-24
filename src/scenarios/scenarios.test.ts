import { describe, expect, it } from "bun:test";
import { computeAssistanteMaternelle } from "./assistante-maternelle/index";
import { renderBilanTableau as renderAssistanteMaternelle } from "./assistante-maternelle/render-table";
import { computeCrecheBerceauEmployeur } from "./creche-berceau-employeur/index";
import { renderBilanTableau as renderCrecheBerceau } from "./creche-berceau-employeur/render-table";
import { computeCrechePublique } from "./creche-publique/index";
import { renderBilanTableau as renderCrechePublique } from "./creche-publique/render-table";
import { computeNounouDomicile } from "./nounou-domicile/index";
import { renderBilanTableau as renderNounou } from "./nounou-domicile/render-table";
import { SCENARIO_SLUGS } from "./registry";

describe("scenarios (GARDE-005 / GARDE-007 / GARDE-008 / GARDE-009)", () => {
  it("registry lists four slugs", () => {
    expect(SCENARIO_SLUGS).toHaveLength(4);
  });

  it("creche publique stub sans participation", () => {
    const r = computeCrechePublique({});
    expect(r.status).toBe("stub");
    expect(r.meta.rulePackVersion).toMatch(/^\d+\.\d+\.\d+/);
    expect(r.meta.effectiveFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const t = renderCrechePublique(r);
    expect(t.scenarioSlug).toBe("creche-publique");
    expect(t.lignes.some((l) => l.libelle.includes("Pack de règles"))).toBe(true);
    expect(t.lignes.some((l) => l.libelle.toLowerCase().includes("smic"))).toBe(true);
  });

  it("creche publique partial avec participation", () => {
    const r = computeCrechePublique({ monthlyParticipationEur: 300, monthlyCmgStructureEur: 50 });
    expect(r.status).toBe("partial");
    expect(r.trace?.netMonthlyBurdenAfterCreditEur).toBeDefined();
    const t = renderCrechePublique(r);
    expect(t.lignes.some((l) => l.libelle.includes("Participation familiale"))).toBe(true);
    expect(t.lignes.some((l) => l.libelle.includes("Crédit d’impôt garde hors domicile"))).toBe(
      true,
    );
  });

  it("creche berceau employeur compute + render", () => {
    const r = computeCrecheBerceauEmployeur({});
    expect(r.meta.rulePackVersion).toBeDefined();
    const t = renderCrecheBerceau(r);
    expect(t.scenarioSlug).toBe("creche-berceau-employeur");
    expect(t.lignes.length).toBeGreaterThanOrEqual(3);
  });

  it("assistante maternelle stub sans coût", () => {
    const r = computeAssistanteMaternelle({});
    expect(r.status).toBe("stub");
    expect(r.meta.rulePackVersion).toBeDefined();
    const t = renderAssistanteMaternelle(r);
    expect(t.scenarioSlug).toBe("assistante-maternelle");
    expect(t.lignes.some((l) => l.libelle.toLowerCase().includes("smic"))).toBe(true);
  });

  it("assistante maternelle partial (CMG calculé depuis revenu)", () => {
    const r = computeAssistanteMaternelle({
      monthlyEmploymentCostEur: 800,
      monthlyHouseholdIncomeForCmgEur: 3000,
      householdChildRank: 1,
    });
    expect(r.status).toBe("partial");
    expect(r.trace?.cmgSource).toBe("calcul_pack");
    expect(r.trace?.monthlyCmgEur).toBeGreaterThan(0);
    const t = renderAssistanteMaternelle(r);
    expect(t.lignes.some((l) => l.libelle.includes("Coût employeur mensuel"))).toBe(true);
  });

  it("nounou domicile compute + render", () => {
    const r = computeNounouDomicile({});
    expect(r.meta.rulePackVersion).toBeDefined();
    const t = renderNounou(r);
    expect(t.scenarioSlug).toBe("nounou-domicile");
  });
});
