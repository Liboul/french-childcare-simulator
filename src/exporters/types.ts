import type { SourceRefConfig } from "../config/schema";
import type { ScenarioInput, ScenarioResult } from "../scenario/types";

export type ScenarioExportMeta = {
  title?: string;
  generatedAtIso: string;
  /** Version du document d’export (évolution du schéma JSON / colonnes CSV). */
  documentFormatVersion: string;
};

export type ScenarioExportBundle = {
  meta: ScenarioExportMeta;
  packSummary?: {
    version: string;
    effectiveFrom: string;
    effectiveTo?: string;
  };
  /** Entrées du scénario (hypothèses). */
  hypotheses: ScenarioInput;
  result: ScenarioResult;
  /** Sources du pack pour les règles effectivement référencées. */
  ruleSources: SourceRefConfig[];
};
