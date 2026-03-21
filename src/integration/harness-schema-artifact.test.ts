import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/** GARDE-021 / GARDE-029 : artefact versionné présent et JSON valide. */
describe("harness/scenario-input.schema.json", () => {
  it("existe et contient $id + oneOf brutInput", () => {
    const path = join(process.cwd(), "harness", "scenario-input.schema.json");
    const raw = JSON.parse(readFileSync(path, "utf8")) as {
      $id?: string;
      title?: string;
      properties?: { brutInput?: unknown };
    };
    expect(raw.$id).toContain("scenario-input");
    expect(raw.title).toBe("ScenarioInput");
    expect(raw.properties?.brutInput).toBeDefined();
  });
});
