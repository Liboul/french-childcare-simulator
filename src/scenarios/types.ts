/** Métadonnées communes à tous les scénarios (traçabilité du pack). */
export type ScenarioEngineMeta = {
  rulePackVersion: string;
  effectiveFrom: string;
};

/** Résultat scénario : `stub` tant que le calcul métier complet n’est pas implémenté. */
export type ScenarioResultBase = {
  scenarioSlug: string;
  status: "stub" | "partial";
  notes: readonly string[];
  meta: ScenarioEngineMeta;
};
