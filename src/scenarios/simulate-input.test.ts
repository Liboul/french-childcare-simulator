import { describe, expect, it } from "bun:test";
import { validateSimulateInput } from "./simulate-input";

describe("simulate-input", () => {
  it("accepts empty object for any slug", () => {
    const r = validateSimulateInput("creche-publique", {});
    expect(r.ok).toBe(true);
  });

  it("rejects unknown keys (strict)", () => {
    const r = validateSimulateInput("creche-publique", { monthlyParticipationEur: 100, typo: 1 });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.issues.some((i) => i.message.toLowerCase().includes("unrecognized"))).toBe(true);
    }
  });

  it("rejects invalid types", () => {
    const r = validateSimulateInput("creche-publique", { monthlyParticipationEur: "300" });
    expect(r.ok).toBe(false);
  });
});
