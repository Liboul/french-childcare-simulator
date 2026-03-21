import { describe, expect, it } from "vitest";
import { projectName } from "./index";

describe("bootstrap", () => {
  it("exports project name", () => {
    expect(projectName).toBe("agent-comparatif-modes-de-garde");
  });
});
