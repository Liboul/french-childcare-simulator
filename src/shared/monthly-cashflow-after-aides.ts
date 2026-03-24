/**
 * Mensualisation pédagogique du crédit d’impôt annuel et reste à charge après CMG.
 * Ne modélise pas l’IR (E3 / DR-07).
 */
export type MonthlyCashflowAfterAides = {
  monthlyCreditEquivalentEur: number;
  netMonthlyCashAfterCmgEur: number;
  netMonthlyBurdenAfterCreditEur: number;
};

export function monthlyCashflowAfterAides(params: {
  monthlyGrossCostEur: number;
  monthlyCmgEur: number;
  annualCreditImpotEur: number;
}): MonthlyCashflowAfterAides {
  const monthlyCreditEquivalentEur = params.annualCreditImpotEur / 12;
  const netMonthlyCashAfterCmgEur = params.monthlyGrossCostEur - params.monthlyCmgEur;
  const netMonthlyBurdenAfterCreditEur = netMonthlyCashAfterCmgEur - monthlyCreditEquivalentEur;
  return {
    monthlyCreditEquivalentEur,
    netMonthlyCashAfterCmgEur,
    netMonthlyBurdenAfterCreditEur,
  };
}
