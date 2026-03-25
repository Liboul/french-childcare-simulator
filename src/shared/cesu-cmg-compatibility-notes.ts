import { findRule } from "../config/find-rule";
import type { RulePack } from "../config/schema";

/**
 * Règle pack `cesu-cmg-non-cumul` : non-cumul documenté surtout pour **CESU déclaratif** × CMG.
 * CESU **préfinancé employeur** : interaction dossier / fiscalité — pas de zéro automatique du CMG ici.
 */
export function appendCesuPrefinanceCmgCompatibilityNotes(
  pack: RulePack,
  opts: { prefinancedCesuEmployerUses: boolean; monthlyCmgEur: number },
): string[] {
  if (!opts.prefinancedCesuEmployerUses || opts.monthlyCmgEur <= 0) {
    return [];
  }
  const rule = findRule(pack, "cesu-cmg-non-cumul");
  const ref = rule ? ` (règle pack \`${rule.id}\`)` : "";
  return [
    `CMG et CESU préfinancé employeur sont **tous deux** renseignés${ref}. Le non-cumul **strict** est documenté pour le **CESU déclaratif** avec la même garde ; le **préfinancé** relève d’un autre mécanisme — **vérifiez** sur votre **dossier CAF / MSA** et les instructions fiscales (cases 7DB / 7DR) que votre situation autorise bien ce cumul ou la ventilation des aides.`,
  ];
}
