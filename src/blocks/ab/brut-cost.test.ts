import { describe, expect, it } from "vitest";
import rulesFr2026 from "../../../config/rules.fr-2026.json" with { type: "json" };
import { parseRulePack } from "../../config/parse";
import { computeBrutMonthlyCost, readSmicHourlyMetropoleEur } from "./brut-cost";

const packResult = parseRulePack(rulesFr2026);
if (!packResult.ok) {
  throw new Error(packResult.error);
}
const pack = packResult.data;

const household = { taxYear: 2026 };

describe("computeBrutMonthlyCost", () => {
  it("reads SMIC métropole from the rule pack", () => {
    expect(readSmicHourlyMetropoleEur(pack)).toBe(12.02);
  });

  it("nounou à domicile : salaire + cotisations patronales explicites", () => {
    const r = computeBrutMonthlyCost(pack, household, {
      mode: "nounou_domicile",
      hourlyGrossEur: 13,
      hoursPerMonth: 80,
      employerShareOfGross: 0.25,
    });
    expect(r.lines[0]).toMatchObject({ label: "Salaire brut mensuel", amountEur: 1040 });
    expect(r.lines[1]!.amountEur).toBeCloseTo(260, 5);
    expect(r.monthlyBrutEur).toBeCloseTo(1300, 5);
  });

  it("garde partagée : majoration 10 % pour 2e enfant simultané, quote-part 50 %", () => {
    const r = computeBrutMonthlyCost(pack, household, {
      mode: "nounou_partagee",
      hourlyGrossEur: 12.51,
      hoursPerMonth: 100,
      simultaneousChildrenCount: 2,
      householdShareOfSalary: 0.5,
      employerShareOfGross: 0.25,
    });
    const totalSalaryUnshared = 12.51 * 100 * 1.1;
    const householdSalary = Math.round(totalSalaryUnshared * 0.5 * 100) / 100;
    const employer = Math.round(householdSalary * 0.25 * 100) / 100;
    expect(r.lines[0]!.amountEur).toBeCloseTo(householdSalary, 5);
    expect(r.monthlyBrutEur).toBeCloseTo(householdSalary + employer, 5);
  });

  it("assistante maternelle : salaire + indemnités + cotisations sur salaire", () => {
    const r = computeBrutMonthlyCost(pack, household, {
      mode: "assistante_maternelle",
      hourlyGrossEur: 4,
      hoursPerMonth: 100,
      careDaysPerMonth: 12,
      indemniteEntretienEurPerDay: 3,
      employerShareOfGross: 0.25,
    });
    expect(r.lines[0]!.amountEur).toBe(400);
    expect(r.lines[1]!.amountEur).toBe(36);
    expect(r.lines[2]!.amountEur).toBe(100);
    expect(r.monthlyBrutEur).toBe(536);
  });

  it("crèche : brut = participation saisie", () => {
    const r = computeBrutMonthlyCost(pack, household, {
      mode: "creche_publique",
      monthlyParticipationEur: 87.5,
    });
    expect(r.monthlyBrutEur).toBe(87.5);
    expect(r.lines).toHaveLength(1);
  });
});
