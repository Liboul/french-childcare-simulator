export {
  computeEmployerChildcareAidTaxableExcessAnnual,
  readAvantageEmployeurCrecheParams,
} from "./avantage-employeur-creche";
export type { AvantageEmployeurCrecheParams } from "./avantage-employeur-creche";
export { computeCmgAssmatEmploiDirectMonthly } from "./cmg-assmat-emploi-direct";
export type { CmgAssmatComputed } from "./cmg-assmat-emploi-direct";
export { computeCmgGardeDomicileEmploiDirectMonthly } from "./cmg-garde-domicile-emploi-direct";
export type { CmgGardeDomicileComputed } from "./cmg-garde-domicile-emploi-direct";
export {
  computeCreditEmploiDomicileAnnual,
  readCreditEmploiDomicileParams,
} from "./credit-emploi-domicile";
export type {
  CreditEmploiDomicileAnnual,
  CreditEmploiDomicilePackParams,
} from "./credit-emploi-domicile";
export {
  computeCreditGardeHorsDomicileAnnual,
  readCreditGardeHorsDomicileParams,
} from "./credit-garde-hors-domicile";
export type {
  CreditGardeHorsDomicileAnnual,
  CreditGardeHorsDomicilePackParams,
} from "./credit-garde-hors-domicile";
export {
  isExplicitMonthlyCmgProvided,
  isIncomeProvidedForCmgFormula,
  resolveCmgFromEmploymentInput,
} from "./cmg-from-employment-input";
export type { CmgEmploymentResolution } from "./cmg-from-employment-input";
export {
  normalizeChildrenCountForCredit,
  normalizeCustody,
  normalizeHouseholdChildRank,
} from "./household";
export { getRulePack, resetRulePackCacheForTests } from "./load-rules";
export {
  computeIrFoyerSimplifie,
  computeIrProgressiveParPart,
  computeQuotientFamilial,
  computeTmiMarginalQuotient,
  readIrBaremeParams,
} from "./ir-impot-revenu";
export type { IrBaremeParams, IrFoyerSimplifieResult, IrProgressiveSlice } from "./ir-impot-revenu";
export { monthlyCashflowAfterAides } from "./monthly-cashflow-after-aides";
export type { MonthlyCashflowAfterAides } from "./monthly-cashflow-after-aides";
