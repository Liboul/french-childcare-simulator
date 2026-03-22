import type { UncertaintyFlag } from "./types";
import { messageFrForWarningCode } from "./warning-messages-fr";

/** Avertissements purement informatifs (hypothèses de modèle). */
const INFO_CODES = new Set<string>([
  "scenario_annual_tax_credit_uses_brut_x12_as_eligible_expense_simplification",
]);

/**
 * Normalise les chaînes `warnings` du moteur en drapeaux exploitables (export / UI).
 */
export function engineWarningsToFlags(warnings: readonly string[]): UncertaintyFlag[] {
  const seen = new Set<string>();
  const out: UncertaintyFlag[] = [];
  for (const code of warnings) {
    if (seen.has(code)) continue;
    seen.add(code);
    const messageFr = messageFrForWarningCode(code);
    out.push({
      code,
      severity: INFO_CODES.has(code) ? "info" : "warning",
      ...(messageFr != null ? { messageFr } : {}),
    });
  }
  return out;
}
