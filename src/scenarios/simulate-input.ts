import { type RefinementCtx, z } from "zod";

const nn = z.number().finite().nonnegative();
const posInt = z.number().int().positive();
const fraction01 = z.number().finite().min(0).max(1);

const fiscalSatelliteKeys = ["revenuNetImposableEur", "nombreParts"] as const;

/** Si CESU préfinancé employeur : le mode est obligatoire. */
export function prefinancedCesuModeRequiredRefine(data: Record<string, unknown>, ctx: RefinementCtx): void {
  if (data.prefinancedCesuEmployerUses === true && data.prefinancedCesuMode == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Si `prefinancedCesuEmployerUses` est true, fournir `prefinancedCesuMode` : `on_top` | `substitutes_constant_employer_cost`.",
      path: ["prefinancedCesuMode"],
    });
  }
}

/** Contrôle satellite : les deux champs ou aucun (IR brut indicatif vs crédit d’impôt). */
export function fiscalPairRefine(data: Record<string, unknown>, ctx: RefinementCtx): void {
  const r = data.revenuNetImposableEur;
  const n = data.nombreParts;
  const hasR = r !== undefined && r !== null && !Number.isNaN(r as number);
  const hasN = n !== undefined && n !== null && !Number.isNaN(n as number);
  if (hasR !== hasN) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Fournir `revenuNetImposableEur` et `nombreParts` ensemble (contrôle satellite crédit vs IR brut indicatif).",
      path: hasR ? ["nombreParts"] : ["revenuNetImposableEur"],
    });
  }
}

/** Champs autorisés par slug (objet JSON) — clés inconnues = erreur de validation (aide l’agent). */
export const simulateInputAllowedKeysBySlug: Record<string, readonly string[]> = {
  "creche-publique": [
    "monthlyParticipationEur",
    "monthlyCmgStructureEur",
    "childrenCount",
    "custody",
    "childcareProviderAcceptsCesu",
    ...fiscalSatelliteKeys,
  ],
  "creche-berceau-employeur": [
    "monthlyParticipationEur",
    "monthlyCmgStructureEur",
    "childrenCount",
    "custody",
    "annualEmployerChildcareAidEur",
    "childrenCountForEmployerThreshold",
    "prefinancedCesuEmployerUses",
    "prefinancedCesuAnnualEur",
    "prefinancedCesuMode",
    "childcareProviderAcceptsCesu",
    "prefinancedCesuAvailableForChildcareFraction",
    ...fiscalSatelliteKeys,
  ],
  "assistante-maternelle": [
    "monthlyEmploymentCostEur",
    "monthlyHouseholdIncomeForCmgEur",
    "householdChildRank",
    "monthlyCmgPaidEur",
    "childrenCount",
    "custody",
    ...fiscalSatelliteKeys,
  ],
  "nounou-domicile": [
    "monthlyEmploymentCostEur",
    "monthlyHouseholdIncomeForCmgEur",
    "householdChildRank",
    "monthlyCmgPaidEur",
    "childrenCountForCreditCeiling",
    "custody",
    "prefinancedCesuEmployerUses",
    "prefinancedCesuMonthlyEur",
    "prefinancedCesuMode",
    "childcareProviderAcceptsCesu",
    "prefinancedCesuAvailableForChildcareFraction",
    "nounouEmploymentModel",
    ...fiscalSatelliteKeys,
  ],
};

const fiscalSatelliteFields = {
  revenuNetImposableEur: nn.optional(),
  nombreParts: z.number().finite().positive().optional(),
};

const crechePubliqueInputSchema = z
  .object({
    monthlyParticipationEur: nn.optional(),
    monthlyCmgStructureEur: nn.optional(),
    childrenCount: posInt.optional(),
    custody: z.enum(["full", "shared"]).optional(),
    childcareProviderAcceptsCesu: z.boolean().optional(),
    ...fiscalSatelliteFields,
  })
  .strict()
  .superRefine(fiscalPairRefine);

const prefinancedCesuModeSchema = z.enum(["on_top", "substitutes_constant_employer_cost"]);

const crecheBerceauEmployeurInputSchema = z
  .object({
    monthlyParticipationEur: nn.optional(),
    monthlyCmgStructureEur: nn.optional(),
    childrenCount: posInt.optional(),
    custody: z.enum(["full", "shared"]).optional(),
    annualEmployerChildcareAidEur: nn.optional(),
    childrenCountForEmployerThreshold: posInt.optional(),
    prefinancedCesuEmployerUses: z.boolean().optional(),
    prefinancedCesuAnnualEur: nn.optional(),
    prefinancedCesuMode: prefinancedCesuModeSchema.optional(),
    childcareProviderAcceptsCesu: z.boolean().optional(),
    prefinancedCesuAvailableForChildcareFraction: fraction01.optional(),
    ...fiscalSatelliteFields,
  })
  .strict()
  .superRefine(fiscalPairRefine)
  .superRefine(prefinancedCesuModeRequiredRefine);

const assistanteMaternelleInputSchema = z
  .object({
    monthlyEmploymentCostEur: nn.optional(),
    monthlyHouseholdIncomeForCmgEur: nn.optional(),
    householdChildRank: posInt.optional(),
    monthlyCmgPaidEur: nn.optional(),
    childrenCount: posInt.optional(),
    custody: z.enum(["full", "shared"]).optional(),
    ...fiscalSatelliteFields,
  })
  .strict()
  .superRefine(fiscalPairRefine);

const nounouEmploymentModelSchema = z.enum(["full_single_employer", "co_famille"]);

const nounouDomicileInputSchema = z
  .object({
    monthlyEmploymentCostEur: nn.optional(),
    monthlyHouseholdIncomeForCmgEur: nn.optional(),
    householdChildRank: posInt.optional(),
    monthlyCmgPaidEur: nn.optional(),
    childrenCountForCreditCeiling: z.number().int().nonnegative().optional(),
    custody: z.enum(["full", "shared"]).optional(),
    prefinancedCesuEmployerUses: z.boolean().optional(),
    prefinancedCesuMonthlyEur: nn.optional(),
    prefinancedCesuMode: prefinancedCesuModeSchema.optional(),
    childcareProviderAcceptsCesu: z.boolean().optional(),
    prefinancedCesuAvailableForChildcareFraction: fraction01.optional(),
    nounouEmploymentModel: nounouEmploymentModelSchema.optional(),
    ...fiscalSatelliteFields,
  })
  .strict()
  .superRefine(fiscalPairRefine)
  .superRefine(prefinancedCesuModeRequiredRefine);

const schemaBySlug: Record<string, z.ZodType<object>> = {
  "creche-publique": crechePubliqueInputSchema,
  "creche-berceau-employeur": crecheBerceauEmployeurInputSchema,
  "assistante-maternelle": assistanteMaternelleInputSchema,
  "nounou-domicile": nounouDomicileInputSchema,
};

export type SimulateInputIssue = { path: string; message: string };

export function validateSimulateInput(
  slug: string,
  raw: unknown,
): { ok: true; data: object } | { ok: false; issues: SimulateInputIssue[] } {
  const schema = schemaBySlug[slug];
  if (!schema) {
    return { ok: false, issues: [{ path: "(slug)", message: `Slug inconnu : ${slug}` }] };
  }
  const parsed = schema.safeParse(raw);
  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }
  return {
    ok: false,
    issues: parsed.error.issues.map((i) => ({
      path: i.path.length ? i.path.join(".") : "(racine)",
      message: i.message,
    })),
  };
}
