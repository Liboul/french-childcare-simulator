import type { RulePack } from "../config/schema";
import { engineWarningsToFlags } from "./engine-warnings";
import type { UncertaintyReport } from "./types";

export type BuildUncertaintyReportInput = {
  engineWarnings: readonly string[];
  /** Identifiants de règles effectivement utilisés dans le calcul (CMG, crédits, garde partagée, etc.). */
  referencedRuleIds: readonly string[];
};

/**
 * Croise les avertissements moteur avec les règles du pack encore en `todoVerify` et référencées.
 */
export function buildUncertaintyReport(
  pack: RulePack,
  input: BuildUncertaintyReportInput,
): UncertaintyReport {
  const flags = engineWarningsToFlags(input.engineWarnings);
  const ref = new Set(input.referencedRuleIds);

  const referencedRulesPendingVerification = pack.rules
    .filter((r) => r.todoVerify === true && ref.has(r.id))
    .map((r) => ({ id: r.id, label: r.label, category: r.category }));

  return { flags, referencedRulesPendingVerification };
}
