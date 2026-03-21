import type { RulePack } from "../config/schema";
import type { PackRulePendingVerification } from "./types";

/** Liste toutes les règles du pack encore marquées `todoVerify` (audit complet). */
export function listTodoVerifyRules(pack: RulePack): PackRulePendingVerification[] {
  return pack.rules
    .filter((r) => r.todoVerify === true)
    .map((r) => ({ id: r.id, label: r.label, category: r.category }));
}
