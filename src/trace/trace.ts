import type { CalculationStep } from "./calculation-step.ts";

export type CalculationTrace = {
  readonly steps: readonly CalculationStep[];
};

export function emptyTrace(): CalculationTrace {
  return { steps: [] };
}

export function appendStep(trace: CalculationTrace, step: CalculationStep): CalculationTrace {
  return { steps: [...trace.steps, step] };
}
