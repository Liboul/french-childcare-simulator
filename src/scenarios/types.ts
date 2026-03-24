/** Résultat commun tant que le moteur métier n’est pas branché (GARDE-005). */
export type ScenarioStubResult = {
  scenarioSlug: string;
  status: "stub";
  notes: readonly string[];
};
