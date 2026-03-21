import type { CalculationBlock } from "./calculation-block";
import type { SourceRef } from "./source-ref";

/**
 * One auditable step: formula + rule + sources (INITIAL_SPEC transparence).
 */
export type CalculationStep = {
  readonly id: string;
  readonly block: CalculationBlock;
  /** Position in the full trace (1-based). */
  readonly order: number;
  readonly label: string;
  /** Human-readable formula or expression name. */
  readonly formula: string;
  /** Optional internal rule id (e.g. config key). */
  readonly ruleId?: string;
  /** Free text for narrative / justification. */
  readonly narrative?: string;
  readonly sources: readonly SourceRef[];
};
