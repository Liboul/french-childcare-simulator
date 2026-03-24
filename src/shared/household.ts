/** Enfants pour plafonds crédit garde hors dom (≥ 1). */
export function normalizeChildrenCountForCredit(raw: number | undefined | null): number {
  return Math.max(1, Math.floor(raw ?? 1));
}

export function normalizeCustody(raw: "full" | "shared" | undefined): "full" | "shared" {
  return raw === "shared" ? "shared" : "full";
}

export function normalizeHouseholdChildRank(raw: number | undefined | null): number {
  return Math.max(1, Math.floor(raw ?? 1));
}
