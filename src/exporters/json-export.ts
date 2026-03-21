import type { ScenarioExportBundle } from "./types";

export function exportScenarioBundleToJson(bundle: ScenarioExportBundle): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}
