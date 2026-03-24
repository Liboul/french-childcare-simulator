/** Slugs supportés — voir `docs/CONVENTIONS.md`. */
export const SCENARIO_SLUGS = [
  "creche-publique",
  "creche-berceau-employeur",
  "assistante-maternelle",
  "nounou-domicile",
] as const;

export type ScenarioSlug = (typeof SCENARIO_SLUGS)[number];

export function isScenarioSlug(s: string): s is ScenarioSlug {
  return (SCENARIO_SLUGS as readonly string[]).includes(s);
}
