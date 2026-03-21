/**
 * Génère `harness/scenario-input.schema.json` depuis le schéma Zod (GARDE-021).
 * Exécuter après modification de `scenario-input.schema.ts` : `bun run schema:scenario`.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { scenarioInputSchema } from "../src/scenario/scenario-input.schema";

const root = join(import.meta.dir, "..");
const outPath = join(root, "harness", "scenario-input.schema.json");

const schema = z.toJSONSchema(scenarioInputSchema) as Record<string, unknown>;
schema.$id = "https://agent-comparatif-modes-de-garde.local/schemas/scenario-input.json";
schema.title = "ScenarioInput";

writeFileSync(outPath, `${JSON.stringify(schema, null, 2)}\n`, "utf8");
console.log("Wrote", outPath);
