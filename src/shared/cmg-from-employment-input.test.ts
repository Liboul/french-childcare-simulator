import { describe, expect, test } from "bun:test";
import {
  isExplicitMonthlyCmgProvided,
  isIncomeProvidedForCmgFormula,
  resolveCmgFromEmploymentInput,
} from "./cmg-from-employment-input";

describe("cmg-from-employment-input", () => {
  test("null si ni saisie ni revenu", () => {
    expect(
      resolveCmgFromEmploymentInput({
        monthlyEmploymentCostEur: 800,
        householdChildRank: 1,
        computeFromPack: () => ({ monthlyCmgEur: 1 }),
      }),
    ).toBeNull();
  });

  test("saisie prioritaire sur revenu si les deux sont fournis", () => {
    const r = resolveCmgFromEmploymentInput({
      monthlyCmgPaidEur: 150,
      monthlyHouseholdIncomeForCmgEur: 3000,
      monthlyEmploymentCostEur: 800,
      householdChildRank: 1,
      computeFromPack: () => {
        throw new Error("ne doit pas être appelé");
      },
    });
    expect(r).toEqual({ kind: "saisie", monthlyCmgEur: 150 });
  });

  test("calcul_pack avec détail", () => {
    const detail = { monthlyCmgEur: 42, x: 1 as const };
    const r = resolveCmgFromEmploymentInput({
      monthlyHouseholdIncomeForCmgEur: 3000,
      monthlyEmploymentCostEur: 800,
      householdChildRank: 2,
      computeFromPack: (args) => {
        expect(args).toEqual({
          monthlyHouseholdIncomeEur: 3000,
          monthlyCostOfCareEur: 800,
          householdChildRank: 2,
        });
        return detail;
      },
    });
    expect(r).toEqual({ kind: "calcul_pack", monthlyCmgEur: 42, detail });
  });

  test("missing_rule si le pack ne renvoie rien", () => {
    const r = resolveCmgFromEmploymentInput({
      monthlyHouseholdIncomeForCmgEur: 3000,
      monthlyEmploymentCostEur: 800,
      householdChildRank: 1,
      computeFromPack: () => null,
    });
    expect(r).toEqual({ kind: "missing_rule" });
  });

  test("isExplicitMonthlyCmgProvided / isIncomeProvidedForCmgFormula", () => {
    expect(isExplicitMonthlyCmgProvided(undefined)).toBe(false);
    expect(isExplicitMonthlyCmgProvided(NaN)).toBe(false);
    expect(isExplicitMonthlyCmgProvided(0)).toBe(true);
    expect(isIncomeProvidedForCmgFormula(100)).toBe(true);
  });
});
