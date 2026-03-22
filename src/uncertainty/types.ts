import type { RuleCategory } from "../config/schema";

/** Variante explicite pour les taux indicatifs contradictoires DR-03 / DR-04 (pas de défaut silencieux). */
export type PajemploiRateVariant = "dr03" | "dr04";

export type UncertaintyFlag = {
  /** Code stable (souvent identique à l’entrée `warnings[]` du moteur). */
  code: string;
  severity: "info" | "warning";
  /** Explication courte en français lorsque le code est répertorié (`warning-messages-fr.ts`). */
  messageFr?: string;
};

export type PackRulePendingVerification = {
  id: string;
  label: string;
  category: RuleCategory;
};

export type UncertaintyReport = {
  flags: UncertaintyFlag[];
  referencedRulesPendingVerification: PackRulePendingVerification[];
};

export type PajemploiRatesOk = {
  ok: true;
  variant: PajemploiRateVariant;
  employerShareOfGrossApprox: number;
  employeeShareOfGrossApprox: number;
  ruleIds: string[];
  warnings: string[];
};

export type PajemploiRatesErr = {
  ok: false;
  warnings: string[];
};

export type PajemploiRatesResult = PajemploiRatesOk | PajemploiRatesErr;
