import { describe, expect, it } from "vitest";
import { projectName } from "./index";

describe("bootstrap", () => {
  it("exports project name", () => {
    expect(projectName).toBe("french-childcare-costs");
  });
});
