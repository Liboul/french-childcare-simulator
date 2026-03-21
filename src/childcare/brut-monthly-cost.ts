import type { HouseholdProfile } from "../household/types";
import { findRule } from "../config/find-rule";
import type { RulePack } from "../config/schema";
import type { BrutCostInput, BrutCostLine, BrutCostResult } from "./model";

export function readSmicHourlyMetropoleEur(pack: RulePack): number {
  const rule = findRule(pack, "tarif-smic-horaire-metropole-2026");
  const hourly = rule?.parameters?.hourlyGrossEur;
  if (typeof hourly !== "number") {
    throw new Error(
      'Rule pack missing numeric "hourlyGrossEur" on tarif-smic-horaire-metropole-2026',
    );
  }
  return hourly;
}

function readGardePartageeIncrementPerExtraChild(pack: RulePack): number {
  const rule = findRule(pack, "garde-partagee-majoration-simultanes-dr04");
  const inc = rule?.parameters?.incrementPerExtraSimultaneousChild;
  if (typeof inc !== "number") {
    throw new Error(
      'Rule pack missing "incrementPerExtraSimultaneousChild" on garde-partagee-majoration-simultanes-dr04',
    );
  }
  return inc;
}

function roundMoney2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Coût brut mensuel pour le mode de garde, hors aides publiques et impôts.
 * `household` est réservé à la traçabilité / validations futures ; non utilisé pour l’instant.
 */
export function computeBrutMonthlyCost(
  pack: RulePack,
  _household: HouseholdProfile,
  input: BrutCostInput,
): BrutCostResult {
  const lines: BrutCostLine[] = [];

  switch (input.mode) {
    case "nounou_domicile": {
      const salary = roundMoney2(input.hourlyGrossEur * input.hoursPerMonth);
      const employer = roundMoney2(salary * input.employerShareOfGross);
      lines.push({ label: "Salaire brut mensuel", amountEur: salary });
      lines.push({
        label: "Cotisations patronales (assiette = salaire brut, taux foyer)",
        amountEur: employer,
      });
      return { monthlyBrutEur: roundMoney2(salary + employer), lines };
    }
    case "nounou_partagee": {
      const inc = readGardePartageeIncrementPerExtraChild(pack);
      const extra = Math.max(0, input.simultaneousChildrenCount - 1);
      const salaryMultiplier = 1 + inc * extra;
      const totalSalary = roundMoney2(
        input.hourlyGrossEur * input.hoursPerMonth * salaryMultiplier,
      );
      const householdSalary = roundMoney2(totalSalary * input.householdShareOfSalary);
      const employer = roundMoney2(householdSalary * input.employerShareOfGross);
      lines.push({
        label: "Salaire brut mensuel (foyer, après majoration simultanés)",
        amountEur: householdSalary,
      });
      lines.push({
        label: "Cotisations patronales (assiette = salaire brut foyer)",
        amountEur: employer,
      });
      return { monthlyBrutEur: roundMoney2(householdSalary + employer), lines };
    }
    case "assistante_maternelle": {
      const salary = roundMoney2(input.hourlyGrossEur * input.hoursPerMonth);
      const indemn = roundMoney2(input.careDaysPerMonth * input.indemniteEntretienEurPerDay);
      const employer = roundMoney2(salary * input.employerShareOfGross);
      lines.push({ label: "Salaire brut mensuel", amountEur: salary });
      lines.push({ label: "Indemnités d'entretien (saisie foyer)", amountEur: indemn });
      lines.push({
        label: "Cotisations patronales (assiette = salaire brut)",
        amountEur: employer,
      });
      return { monthlyBrutEur: roundMoney2(salary + indemn + employer), lines };
    }
    case "mam": {
      const salary = roundMoney2(input.hourlyGrossEur * input.hoursPerMonth);
      const indemn = roundMoney2(input.careDaysPerMonth * input.indemniteEntretienEurPerDay);
      const employer = roundMoney2(salary * input.employerShareOfGross);
      const struct = roundMoney2(input.structureParticipationEurPerMonth);
      lines.push({ label: "Salaire brut mensuel", amountEur: salary });
      lines.push({ label: "Indemnités d'entretien (saisie foyer)", amountEur: indemn });
      lines.push({
        label: "Cotisations patronales (assiette = salaire brut)",
        amountEur: employer,
      });
      lines.push({ label: "Participation structure MAM (saisie foyer)", amountEur: struct });
      return { monthlyBrutEur: roundMoney2(salary + indemn + employer + struct), lines };
    }
    case "creche_publique":
    case "creche_privee":
    case "creche_inter_entreprises": {
      const fee = roundMoney2(input.monthlyParticipationEur);
      lines.push({ label: "Participation mensuelle (tarif local / contrat)", amountEur: fee });
      return { monthlyBrutEur: fee, lines };
    }
    default: {
      const _exhaustive: never = input;
      return _exhaustive;
    }
  }
}
