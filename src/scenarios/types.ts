/** CESU préfinancé côté employeur : en plus du coût / aide saisi, ou arbitrage pour même enveloppe totale. */
export type PrefinancedCesuMode = "on_top" | "substitutes_constant_employer_cost";

/** Nounou à domicile : employeur unique « à 100 % » pour ce contrat vs co-famille (plusieurs foyers employeurs). */
export type NounouEmploymentModel = "full_single_employer" | "co_famille";

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
