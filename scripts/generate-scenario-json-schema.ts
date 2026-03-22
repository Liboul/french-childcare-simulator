/**
 * Génère `harness/scenario-input.schema.json` depuis le schéma Zod (GARDE-021).
 * Sortie formatée comme Prettier (CI : `git diff` après `bun run schema:scenario`).
 * Exécuter après modification de `scenario-input.schema.ts` : `bun run schema:scenario`.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import * as prettier from "prettier";
import { z } from "zod";
import { scenarioInputSchema } from "../src/scenario/scenario-input.schema";

const root = join(import.meta.dir, "..");
const outPath = join(root, "harness", "scenario-input.schema.json");

const schema = z.toJSONSchema(scenarioInputSchema) as Record<string, unknown>;
schema.$id = "https://french-childcare-costs.local/schemas/scenario-input.json";
schema.title = "ScenarioInput";

const rough = `${JSON.stringify(schema, null, 2)}\n`;
const prettierOptions = await prettier.resolveConfig(outPath);
const formatted = await prettier.format(rough, {
  ...prettierOptions,
  filepath: outPath,
});
writeFileSync(outPath, formatted, "utf8");
console.log("Wrote", outPath);
