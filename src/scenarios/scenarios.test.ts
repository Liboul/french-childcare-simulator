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

describe("scenarios (GARDE-005 … GARDE-011)", () => {
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

  it("creche publique stub si participation negative ou NaN", () => {
    expect(computeCrechePublique({ monthlyParticipationEur: -1 }).status).toBe("stub");
    expect(computeCrechePublique({ monthlyParticipationEur: Number.NaN }).status).toBe("stub");
  });

  it("creche publique partial avec participation 0", () => {
    const r = computeCrechePublique({ monthlyParticipationEur: 0, monthlyCmgStructureEur: 0 });
    expect(r.status).toBe("partial");
    expect(r.trace?.monthlyParticipationEur).toBe(0);
    expect(r.trace?.netMonthlyCashAfterCmgEur).toBe(0);
  });

  it("creche publique note coherence si participation et CMG structure non nuls", () => {
    const r = computeCrechePublique({ monthlyParticipationEur: 200, monthlyCmgStructureEur: 30 });
    expect(r.status).toBe("partial");
    expect(r.notes.some((n) => n.includes("Contrôle saisie"))).toBe(true);
  });

  it("creche publique normalise childrenCount (decimal vers entier, min 1)", () => {
    const r = computeCrechePublique({
      monthlyParticipationEur: 100,
      childrenCount: 2.7,
    });
    expect(r.trace?.childrenCount).toBe(2);
  });

  it("creche publique custody shared dans la trace", () => {
    const r = computeCrechePublique({
      monthlyParticipationEur: 400,
      custody: "shared",
    });
    expect(r.trace?.custody).toBe("shared");
  });

  it("creche publique : satellite crédit vs IR si RNI + parts", () => {
    const r = computeCrechePublique({
      monthlyParticipationEur: 300,
      monthlyCmgStructureEur: 50,
      revenuNetImposableEur: 30_000,
      nombreParts: 1,
    });
    expect(r.status).toBe("partial");
    expect(r.trace?.creditVsIrBrutSatellite).toBeDefined();
    expect(r.trace?.creditVsIrBrutSatellite?.irBrutEur).toBeGreaterThan(0);
    expect(r.trace?.creditVsIrBrutSatellite?.annualCreditImpotEur).toBe(
      r.trace?.annualCreditGardeHorsDomicileEur,
    );
  });

  it("creche berceau employeur stub sans participation", () => {
    const r = computeCrecheBerceauEmployeur({});
    expect(r.status).toBe("stub");
    expect(r.meta.rulePackVersion).toBeDefined();
    const t = renderCrecheBerceau(r);
    expect(t.scenarioSlug).toBe("creche-berceau-employeur");
    expect(t.lignes.some((l) => l.libelle.toLowerCase().includes("smic"))).toBe(true);
  });

  it("creche berceau employeur partial + aide employeur", () => {
    const r = computeCrecheBerceauEmployeur({
      monthlyParticipationEur: 280,
      monthlyCmgStructureEur: 40,
      annualEmployerChildcareAidEur: 2000,
    });
    expect(r.status).toBe("partial");
    expect(r.trace?.employerTaxableExcessAnnualEur).toBe(170);
    const t = renderCrecheBerceau(r);
    expect(t.lignes.some((l) => l.libelle.includes("Seuil exonération employeur"))).toBe(true);
  });

  it("creche berceau employeur stub si participation negative", () => {
    expect(computeCrecheBerceauEmployeur({ monthlyParticipationEur: -1 }).status).toBe("stub");
  });

  it("creche berceau employeur seuil employeur: plus d enfants => plus de plafond exonere", () => {
    const r = computeCrecheBerceauEmployeur({
      monthlyParticipationEur: 200,
      annualEmployerChildcareAidEur: 2000,
      childrenCountForEmployerThreshold: 2,
    });
    expect(r.status).toBe("partial");
    expect(r.trace?.employerThresholdChildrenCount).toBe(2);
    expect(r.trace?.employerTaxableExcessAnnualEur).toBe(0);
    expect(r.trace?.employerExemptPortionAnnualEur).toBe(2000);
  });

  it("creche berceau employeur note coherence participation + CMG", () => {
    const r = computeCrecheBerceauEmployeur({
      monthlyParticipationEur: 280,
      monthlyCmgStructureEur: 40,
    });
    expect(r.notes.some((n) => n.includes("Contrôle saisie"))).toBe(true);
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

  it("assistante maternelle stub si coût negatif", () => {
    expect(computeAssistanteMaternelle({ monthlyEmploymentCostEur: -1 }).status).toBe("stub");
  });

  it("assistante maternelle stub sans CMG ni revenu (coût seul)", () => {
    const r = computeAssistanteMaternelle({ monthlyEmploymentCostEur: 500 });
    expect(r.status).toBe("stub");
    expect(r.notes.some((n) => n.includes("monthlyCmgPaidEur") || n.includes("monthlyHouseholdIncomeForCmgEur"))).toBe(
      true,
    );
  });

  it("assistante maternelle CMG saisi prioritaire sur revenu si les deux fournis", () => {
    const r = computeAssistanteMaternelle({
      monthlyEmploymentCostEur: 800,
      monthlyCmgPaidEur: 100,
      monthlyHouseholdIncomeForCmgEur: 3000,
      householdChildRank: 1,
    });
    expect(r.status).toBe("partial");
    expect(r.trace?.cmgSource).toBe("saisie");
    expect(r.trace?.monthlyCmgEur).toBe(100);
    expect(r.notes.some((n) => n.includes("CMG saisi") && n.includes("revenu"))).toBe(true);
  });

  it("assistante maternelle partial avec monthlyCmgPaidEur 0 explicite (sans revenu)", () => {
    const r = computeAssistanteMaternelle({
      monthlyEmploymentCostEur: 600,
      monthlyCmgPaidEur: 0,
    });
    expect(r.status).toBe("partial");
    expect(r.trace?.cmgSource).toBe("saisie");
    expect(r.trace?.monthlyCmgEur).toBe(0);
  });

  it("nounou domicile stub sans coût", () => {
    const r = computeNounouDomicile({});
    expect(r.status).toBe("stub");
    expect(r.meta.rulePackVersion).toBeDefined();
    const t = renderNounou(r);
    expect(t.scenarioSlug).toBe("nounou-domicile");
    expect(t.lignes.some((l) => l.libelle.toLowerCase().includes("smic"))).toBe(true);
  });

  it("nounou domicile partial (CMG calculé + crédit emploi à domicile)", () => {
    const r = computeNounouDomicile({
      monthlyEmploymentCostEur: 1200,
      monthlyHouseholdIncomeForCmgEur: 3500,
      householdChildRank: 1,
      childrenCountForCreditCeiling: 1,
    });
    expect(r.status).toBe("partial");
    expect(r.trace?.cmgSource).toBe("calcul_pack");
    expect(r.trace?.annualCreditEmploiDomicileEur).toBeGreaterThan(0);
    const t = renderNounou(r);
    expect(t.lignes.some((l) => l.libelle.includes("Crédit d’impôt emploi à domicile"))).toBe(true);
  });

  it("nounou domicile stub si coût negatif", () => {
    expect(computeNounouDomicile({ monthlyEmploymentCostEur: -1 }).status).toBe("stub");
  });

  it("nounou domicile stub sans CMG ni revenu", () => {
    const r = computeNounouDomicile({ monthlyEmploymentCostEur: 900 });
    expect(r.status).toBe("stub");
  });

  it("nounou domicile childrenCountForCreditCeiling 0 => plafond annuel sans majoration enfant", () => {
    const base = {
      monthlyEmploymentCostEur: 1200,
      monthlyHouseholdIncomeForCmgEur: 3500,
      householdChildRank: 1,
    };
    const r0 = computeNounouDomicile({ ...base, childrenCountForCreditCeiling: 0 });
    const r1 = computeNounouDomicile({ ...base, childrenCountForCreditCeiling: 1 });
    expect(r0.status).toBe("partial");
    expect(r1.status).toBe("partial");
    expect(r0.trace?.annualCeilingExpenseForCreditEur).toBe(12000);
    expect(r1.trace?.annualCeilingExpenseForCreditEur).toBe(13500);
  });

  it("nounou domicile custody shared reduit les majorations de plafond credit", () => {
    const base = {
      monthlyEmploymentCostEur: 1200,
      monthlyHouseholdIncomeForCmgEur: 3500,
      householdChildRank: 1,
      childrenCountForCreditCeiling: 1,
    };
    const rFull = computeNounouDomicile({ ...base, custody: "full" });
    const rShared = computeNounouDomicile({ ...base, custody: "shared" });
    expect(rFull.trace!.annualCeilingExpenseForCreditEur).toBeGreaterThan(
      rShared.trace!.annualCeilingExpenseForCreditEur,
    );
  });

  it("nounou domicile CMG saisi prioritaire sur revenu", () => {
    const r = computeNounouDomicile({
      monthlyEmploymentCostEur: 1000,
      monthlyCmgPaidEur: 80,
      monthlyHouseholdIncomeForCmgEur: 4000,
      householdChildRank: 1,
    });
    expect(r.status).toBe("partial");
    expect(r.trace?.cmgSource).toBe("saisie");
    expect(r.trace?.monthlyCmgEur).toBe(80);
  });
});
