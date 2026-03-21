export type CesuCmgGateInput = {
  /** Le foyer perçoit une aide CAF/MSA type garde (ex. CMG) pour la même prise en charge. */
  receivesCmgOrSimilarChildcareAid: boolean;
  /** Garde d’enfants déclarée en CESU déclaratif pour la même situation. */
  usesCesuDeclaratifForSameChildcare: boolean;
};

export type CesuCmgGateResult = {
  compatible: boolean;
  /** Clé stable pour i18n / trace. */
  messageKey: "cesu_cmg_ok" | "cesu_cmg_non_cumul_dr03";
  ruleIds: string[];
};

export type PrefundedCesuDescription = {
  annualAmountEur: number;
  /** À déduire de l’assiette du crédit d’impôt emploi à domicile (DR-03 / case 7DR), traitement ultérieur en GARDE-009. */
  reducesEmploymentTaxCreditBase: true;
  ruleIds: string[];
  warnings: string[];
};

export type EmployerCrecheSplitResult = {
  exemptAnnualTotalEur: number;
  taxableFringeAnnualTotalEur: number;
  perChild: Array<{ exemptEur: number; taxableFringeEur: number }>;
  ruleIds: string[];
  warnings: string[];
};
