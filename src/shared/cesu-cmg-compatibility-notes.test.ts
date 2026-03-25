import { describe, expect, it } from "bun:test";
import { appendCesuPrefinanceCmgCompatibilityNotes } from "./cesu-cmg-compatibility-notes";
import { getRulePack } from "./load-rules";

describe("appendCesuPrefinanceCmgCompatibilityNotes", () => {
  const pack = getRulePack();

  it("returns empty when CESU préfinancé is not used", () => {
    expect(
      appendCesuPrefinanceCmgCompatibilityNotes(pack, {
        prefinancedCesuEmployerUses: false,
        monthlyCmgEur: 100,
      }),
    ).toEqual([]);
  });

  it("returns empty when CMG is 0 (no interaction à signaler)", () => {
    expect(
      appendCesuPrefinanceCmgCompatibilityNotes(pack, {
        prefinancedCesuEmployerUses: true,
        monthlyCmgEur: 0,
      }),
    ).toEqual([]);
  });

  it("returns one note with dossier CAF/MSA, 7DB/7DR et règle pack quand CESU + CMG > 0", () => {
    const notes = appendCesuPrefinanceCmgCompatibilityNotes(pack, {
      prefinancedCesuEmployerUses: true,
      monthlyCmgEur: 42,
    });
    expect(notes).toHaveLength(1);
    const n = notes[0]!;
    expect(n).toContain("CMG et CESU préfinancé");
    expect(n).toContain("dossier CAF");
    expect(n).toContain("7DB");
    expect(n).toContain("7DR");
    expect(n).toContain("cesu-cmg-non-cumul");
  });
});
