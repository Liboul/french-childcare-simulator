import { z } from "zod";

/** Citation stored in config (aligned with trace `SourceRef`). */
export const sourceRefConfigSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url(),
});

export type SourceRefConfig = z.infer<typeof sourceRefConfigSchema>;

export const ruleCategorySchema = z.enum([
  "cmg",
  "credit_impot",
  "tarif",
  "cotisation",
  "avantage_employeur",
  "autre",
]);

export type RuleCategory = z.infer<typeof ruleCategorySchema>;

/** One auditable rule row (amounts live in `parameters` until typed further). */
export const ruleEntrySchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  category: ruleCategorySchema,
  /** Official sources backing this rule; empty only if `todoVerify` is true. */
  sources: z.array(sourceRefConfigSchema),
  /** Arbitrary structured values (rates, caps, brackets) — refined in later stories. */
  parameters: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  /** When true, rule is a placeholder pending owner research (GARDE-004). */
  todoVerify: z.boolean().optional(),
});

export type RuleEntry = z.infer<typeof ruleEntrySchema>;

export const rulePackSchema = z
  .object({
    version: z.string().min(1),
    effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u, "expected ISO date YYYY-MM-DD"),
    effectiveTo: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/u, "expected ISO date YYYY-MM-DD")
      .optional(),
    /** Global source index (optional; rules also carry sources). */
    sources: z.array(sourceRefConfigSchema).default([]),
    rules: z.array(ruleEntrySchema),
  })
  .superRefine((pack, ctx) => {
    pack.rules.forEach((rule, index) => {
      const hasSources = rule.sources.length > 0;
      if (!hasSources && !rule.todoVerify) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Rule "${rule.id}" must list sources or set todoVerify: true`,
          path: ["rules", index, "sources"],
        });
      }
    });
  });

export type RulePack = z.infer<typeof rulePackSchema>;
