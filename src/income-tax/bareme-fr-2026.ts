import baremeJson from "../../config/income-tax-bareme.fr-2026.json";

export type QuotientSlice = {
  taxableFromExclusive: number;
  taxableToInclusive: number | null;
  rate: number;
};

export type IncomeTaxBaremeFr2026 = {
  version: string;
  taxYear: number;
  revenueYear: number;
  quotientSlices: QuotientSlice[];
  salaryAbattement: {
    rate: number;
    minimumEur: number;
    maximumEur: number;
  };
  decote: {
    individual: {
      thresholdImpotBrutEur: number;
      constantEur: number;
      coefficient: number;
    };
    joint: {
      thresholdImpotBrutEur: number;
      constantEur: number;
      coefficient: number;
    };
  };
};

export const incomeTaxBaremeFr2026 = baremeJson as IncomeTaxBaremeFr2026;
