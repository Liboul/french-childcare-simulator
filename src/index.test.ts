import { describe, expect, it } from "bun:test";
import { projectId } from "./index.js";

describe("bootstrap", () => {
  it("exports project id", () => {
    expect(projectId).toBe("french-childcare-costs");
  });
});
