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
    const satNotes = r.trace!.creditVsIrBrutSatellite!.notes.join(" ");
    expect(satNotes).toContain("coût réel global");
    expect(satNotes).toContain("baisse de brut");
    expect(satNotes).toContain("diminution d’IR");
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
    expect(r.trace?.employerAidSalaryTaxableExcessApplies).toBe(true);
    const t = renderCrecheBerceau(r);
    expect(t.lignes.some((l) => l.libelle.includes("Seuil exonération employeur"))).toBe(true);
    expect(t.lignes.some((l) => l.libelle.includes("Excédent imposable salaire (modèle seuil désactivé)"))).toBe(
      false,
    );
    expect(t.lignes.some((l) => l.libelle.includes("Excédent d’aide employeur (imposable en salaire"))).toBe(true);
    expect(r.notes.some((n) => n.includes("cotisations patronales"))).toBe(false);
  });

  it("creche berceau employeur — pas d’excédent salaire (CIF / convention)", () => {
    const r = computeCrecheBerceauEmployeur({
      monthlyParticipationEur: 800,
      annualEmployerChildcareAidEur: 16000,
      employerAidSalaryTaxableExcessApplies: false,
      annualEmployerNetCostAfterCifEur: 4000,
    });
    expect(r.status).toBe("partial");
    expect(r.trace?.employerTaxableExcessAnnualEur).toBe(0);
    expect(r.trace?.employerAidSalaryTaxableExcessApplies).toBe(false);
    expect(r.trace?.annualEmployerNetCostAfterCifEur).toBe(4000);
    const t = renderCrecheBerceau(r);
    expect(t.lignes.some((l) => l.libelle.includes("Excédent imposable salaire (modèle seuil désactivé)"))).toBe(
      true,
    );
    expect(t.lignes.some((l) => l.libelle.includes("Coût employeur après CIF"))).toBe(true);
    expect(t.lignes.some((l) => l.libelle.includes("Arbitrage brut / cotisations patronales"))).toBe(true);
    expect(r.notes.some((n) => n.includes("cotisations patronales"))).toBe(true);
    expect(r.notes.some((n) => n.includes("gain d’IR"))).toBe(true);
  });

  it("creche berceau employeur — excédent salaire désactivé sans ligne CIF si coût net CIF absent", () => {
    const r = computeCrecheBerceauEmployeur({
      monthlyParticipationEur: 600,
      annualEmployerChildcareAidEur: 10000,
      employerAidSalaryTaxableExcessApplies: false,
    });
    expect(r.status).toBe("partial");
    expect(r.trace?.employerTaxableExcessAnnualEur).toBe(0);
    expect(r.trace?.annualEmployerNetCostAfterCifEur).toBeUndefined();
    const t = renderCrecheBerceau(r);
    expect(t.lignes.some((l) => l.libelle.includes("Coût employeur après CIF"))).toBe(false);
    expect(t.lignes.some((l) => l.libelle.includes("Arbitrage brut / cotisations patronales"))).toBe(true);
    expect(r.notes.some((n) => n.includes("cotisations patronales"))).toBe(true);
  });

  it("creche berceau employeur — CESU substitutes déclenche note et ligne arbitrage brut / cotisations patronales", () => {
    const r = computeCrecheBerceauEmployeur({
      monthlyParticipationEur: 350,
      annualEmployerChildcareAidEur: 3000,
      prefinancedCesuEmployerUses: true,
      prefinancedCesuAnnualEur: 1200,
      prefinancedCesuMode: "substitutes_constant_employer_cost",
    });
    expect(r.status).toBe("partial");
    expect(r.trace?.employerAidSalaryTaxableExcessApplies).toBe(true);
    const t = renderCrecheBerceau(r);
    expect(t.lignes.some((l) => l.libelle.includes("Arbitrage brut / cotisations patronales"))).toBe(true);
    expect(r.notes.some((n) => n.includes("cotisations patronales"))).toBe(true);
  });

  it("creche berceau employeur — CESU on_top ne déclenche pas la note cotisations patronales (seuil substitutes / CIF)", () => {
    const r = computeCrecheBerceauEmployeur({
      monthlyParticipationEur: 400,
      annualEmployerChildcareAidEur: 2000,
      prefinancedCesuEmployerUses: true,
      prefinancedCesuAnnualEur: 500,
      prefinancedCesuMode: "on_top",
    });
    expect(r.status).toBe("partial");
    expect(r.notes.some((n) => n.includes("cotisations patronales"))).toBe(false);
  });

  it("nounou — CESU substitutes : note cotisations patronales", () => {
    const r = computeNounouDomicile({
      monthlyEmploymentCostEur: 900,
      monthlyCmgPaidEur: 100,
      prefinancedCesuEmployerUses: true,
      prefinancedCesuMonthlyEur: 200,
      prefinancedCesuMode: "substitutes_constant_employer_cost",
    });
    expect(r.status).toBe("partial");
    expect(r.notes.some((n) => n.includes("cotisations patronales"))).toBe(true);
    const t = renderNounou(r);
    expect(t.lignes.some((l) => l.libelle.includes("Arbitrage brut / cotisations patronales"))).toBe(true);
    expect(r.notes.some((n) => n.includes("gain d’IR"))).toBe(true);
  });

  it("nounou — CESU on_top : pas de note cotisations patronales (réservé substitutes)", () => {
    const r = computeNounouDomicile({
      monthlyEmploymentCostEur: 900,
      monthlyCmgPaidEur: 100,
      prefinancedCesuEmployerUses: true,
      prefinancedCesuMonthlyEur: 150,
      prefinancedCesuMode: "on_top",
    });
    expect(r.status).toBe("partial");
    expect(r.notes.some((n) => n.includes("cotisations patronales"))).toBe(false);
  });

  it("nounou — satellite IR avec RNI : notes coût réel global et diminution IR", () => {
    const r = computeNounouDomicile({
      monthlyEmploymentCostEur: 1000,
      monthlyCmgPaidEur: 50,
      revenuNetImposableEur: 55_000,
      nombreParts: 2,
    });
    expect(r.status).toBe("partial");
    const sat = r.trace?.creditVsIrBrutSatellite;
    expect(sat).toBeDefined();
    const text = sat!.notes.join(" ");
    expect(text).toContain("coût réel global");
    expect(text).toContain("diminution d’IR");
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

  it("nounou — coût depuis brut horaire + Navigo + crédit (validation terrain, ±1,5 €)", () => {
    const r = computeNounouDomicile({
      hourlyGrossRateEur: 15,
      weeklyHoursFullTime: 40,
      householdShareFraction: 0.4444,
      includeIcp: true,
      nounouEmploymentModel: "co_famille",
      coFamilleHouseholdCostSharePercent: 44.44,
      monthlyNavigoShareEur: 20,
      monthlyHouseholdIncomeForCmgEur: 10000,
      childrenCountForCreditCeiling: 1,
      revenuNetImposableEur: 120_000,
      nombreParts: 2.5,
    });
    expect(r.status).toBe("partial");
    const t = r.trace!;
    expect(t.monthlyEmploymentCostComputedFromHourly).toBe(true);
    expect(Math.abs(t.computedMonthlyGrossSalaryEur! - 1156)).toBeLessThanOrEqual(1);
    expect(Math.abs(t.computedMonthlyPatronalChargesEur! - 521)).toBeLessThanOrEqual(1);
    expect(Math.abs(t.computedMonthlyIcpEur! - 116)).toBeLessThanOrEqual(1);
    expect(Math.abs(t.monthlyEmploymentCostEur - 1793)).toBeLessThanOrEqual(1);
    expect(t.annualCreditEmploiDomicileEur).toBe(6750);
    expect(Math.abs(t.netMonthlyBurdenAfterCreditEur - 1230)).toBeLessThanOrEqual(1.5);
    expect(t.monthlyNavigoShareEur).toBe(20);
    expect(Math.abs(t.estimatedMonthlyHouseholdCashOutEur - 1251)).toBeLessThanOrEqual(1.5);
  });

  it("nounou — CESU substitutes : trace delta brut ≠ montant CESU", () => {
    const r = computeNounouDomicile({
      monthlyEmploymentCostEur: 900,
      monthlyCmgPaidEur: 100,
      prefinancedCesuEmployerUses: true,
      prefinancedCesuMonthlyEur: 200,
      prefinancedCesuMode: "substitutes_constant_employer_cost",
    });
    expect(r.status).toBe("partial");
    const t = r.trace!;
    expect(t.cesuSubstitutionDeltaBrutEur).toBeDefined();
    expect(t.cesuSubstitutionDeltaBrutEur!).not.toBe(200);
    expect(t.cesuSubstitutionNetSalaryImpactEur).toBeDefined();
    expect(t.cesuNetGainVsSalaryEur).toBeDefined();
  });

  describe("CMG × CESU préfinancé, frais annexes, co-famille (couverture conversation)", () => {
    it("creche publique : frais annexes dans trace, note et tableau de bilan", () => {
      const r = computeCrechePublique({
        monthlyParticipationEur: 300,
        monthlyCmgStructureEur: 50,
        monthlyAncillaryCostsEur: 40,
      });
      expect(r.status).toBe("partial");
      const net = r.trace!.netMonthlyBurdenAfterCreditEur;
      expect(r.trace!.monthlyAncillaryCostsEur).toBe(40);
      expect(r.trace!.estimatedMonthlyHouseholdCashOutEur).toBe(net + 40);
      expect(r.notes.some((n) => n.includes("Frais annexes") && n.includes("monthlyAncillaryCostsEur"))).toBe(
        true,
      );
      const t = renderCrechePublique(r);
      expect(t.lignes.some((l) => l.libelle.includes("Frais annexes"))).toBe(true);
      expect(t.lignes.some((l) => l.libelle.includes("Effort total estimé"))).toBe(true);
    });

    it("creche berceau : note CESU×CMG si préfinancé + CMG structure > 0", () => {
      const r = computeCrecheBerceauEmployeur({
        monthlyParticipationEur: 200,
        monthlyCmgStructureEur: 30,
        prefinancedCesuEmployerUses: true,
        prefinancedCesuMode: "on_top",
        prefinancedCesuAnnualEur: 400,
      });
      expect(r.status).toBe("partial");
      expect(
        r.notes.some((n) => n.includes("CMG et CESU préfinancé") && n.includes("7DR")),
      ).toBe(true);
    });

    it("creche berceau : pas de note append CESU×CMG si CMG structure = 0", () => {
      const r = computeCrecheBerceauEmployeur({
        monthlyParticipationEur: 200,
        monthlyCmgStructureEur: 0,
        prefinancedCesuEmployerUses: true,
        prefinancedCesuMode: "on_top",
        prefinancedCesuAnnualEur: 400,
      });
      expect(r.status).toBe("partial");
      expect(r.notes.some((n) => n.includes("CMG et CESU préfinancé"))).toBe(false);
    });

    it("creche berceau : frais annexes dans trace (effort total)", () => {
      const r = computeCrecheBerceauEmployeur({
        monthlyParticipationEur: 250,
        monthlyCmgStructureEur: 40,
        monthlyAncillaryCostsEur: 35,
      });
      expect(r.status).toBe("partial");
      expect(r.trace!.monthlyAncillaryCostsEur).toBe(35);
      expect(r.trace!.estimatedMonthlyHouseholdCashOutEur).toBe(
        r.trace!.netMonthlyBurdenAfterCreditEur + 35,
      );
      const t = renderCrecheBerceau(r);
      expect(t.lignes.some((l) => l.libelle.includes("Effort total estimé"))).toBe(true);
    });

    it("assistante : CESU indicateur + CMG > 0 → note compatibilité ; bilan CESU si true", () => {
      const r = computeAssistanteMaternelle({
        monthlyEmploymentCostEur: 700,
        monthlyCmgPaidEur: 90,
        prefinancedCesuEmployerUses: true,
        monthlyAncillaryCostsEur: 25,
      });
      expect(r.status).toBe("partial");
      expect(r.trace?.prefinancedCesuEmployerUses).toBe(true);
      expect(r.notes.some((n) => n.includes("CMG et CESU préfinancé"))).toBe(true);
      expect(r.trace!.estimatedMonthlyHouseholdCashOutEur).toBe(
        r.trace!.netMonthlyBurdenAfterCreditEur + 25,
      );
      const t = renderAssistanteMaternelle(r);
      expect(t.lignes.some((l) => l.libelle.includes("CESU préfinancé employeur (information)"))).toBe(
        true,
      );
    });

    it("nounou : note 7DR / crédit 199 vs CESU déclaratif si CESU préfinancé", () => {
      const r = computeNounouDomicile({
        monthlyEmploymentCostEur: 900,
        monthlyCmgPaidEur: 100,
        prefinancedCesuEmployerUses: true,
        prefinancedCesuMode: "on_top",
        prefinancedCesuMonthlyEur: 50,
      });
      expect(r.status).toBe("partial");
      expect(
        r.notes.some((n) => n.includes("Déclaration fiscale") && n.includes("7DR")),
      ).toBe(true);
      expect(r.notes.some((n) => n.includes("CMG et CESU préfinancé"))).toBe(true);
    });

    it("nounou : pas de note CESU×CMG du helper si CMG = 0", () => {
      const r = computeNounouDomicile({
        monthlyEmploymentCostEur: 900,
        monthlyCmgPaidEur: 0,
        prefinancedCesuEmployerUses: true,
        prefinancedCesuMode: "on_top",
        prefinancedCesuMonthlyEur: 50,
      });
      expect(r.status).toBe("partial");
      expect(r.notes.some((n) => n.includes("CMG et CESU préfinancé"))).toBe(false);
    });

    it("nounou : co-famille avec part % — trace, notes et bilan", () => {
      const r = computeNounouDomicile({
        monthlyEmploymentCostEur: 800,
        monthlyCmgPaidEur: 60,
        nounouEmploymentModel: "co_famille",
        coFamilleHouseholdCostSharePercent: 50,
        monthlyAncillaryCostsEur: 20,
      });
      expect(r.status).toBe("partial");
      expect(r.trace?.coFamilleHouseholdCostSharePercent).toBe(50);
      expect(
        r.notes.some((n) => n.includes("co-famille") && n.includes("50")),
      ).toBe(true);
      expect(r.trace!.estimatedMonthlyHouseholdCashOutEur).toBe(
        r.trace!.netMonthlyBurdenAfterCreditEur + 20,
      );
      const t = renderNounou(r);
      expect(t.lignes.some((l) => l.libelle.includes("Part de coût de ce foyer (co-famille, %)"))).toBe(
        true,
      );
      expect(t.lignes.some((l) => l.libelle.includes("Frais annexes"))).toBe(true);
    });
  });
});
