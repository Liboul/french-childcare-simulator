import { getRulePack } from "../../shared/load-rules";
import type { BilanTableau } from "../bilan-table";
import { baseBilanLignes } from "../render-common";
import type { CrechePubliqueResult } from "./index";

export function renderBilanTableau(result: CrechePubliqueResult): BilanTableau {
  const pack = getRulePack();
  return {
    scenarioSlug: result.scenarioSlug,
    periode: "mois",
    lignes: baseBilanLignes(result, pack),
  };
}
