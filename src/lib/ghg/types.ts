import { z } from "zod";

export const ghgSourceScopeSchema = z.enum(["scope1", "scope2", "scope3"]);

export const ghgSourceMethodSchema = z.enum([
  "stationary_combustion",
  "mobile_combustion",
  "fugitive_emissions",
  "purchased_electricity",
  "purchased_heat_cooling_steam",
  "business_travel",
  "employee_commuting",
  "purchased_goods_services",
  "waste_generated",
  "upstream_transport_distribution",
  "downstream_transport_distribution",
  "other",
]);

export const ghgActivityInputSchema = z.object({
  sourceKey: z.string().trim().min(1).max(120),
  sourceName: z.string().trim().min(1).max(160),
  scope: ghgSourceScopeSchema,
  method: ghgSourceMethodSchema,
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  activityAmount: z.number().nonnegative(),
  activityUnit: z.string().trim().min(1).max(24),
  emissionFactor: z.number().nonnegative(),
  emissionFactorUnit: z.string().trim().min(1).max(40),
  uncertaintyPct: z.number().min(0).max(100).default(0),
  notes: z.string().trim().max(800).optional(),
});

export const ghgReportRequestSchema = z.object({
  organizationId: z.string().uuid(),
  reportingPeriodId: z.string().uuid(),
  reportYear: z.number().int().min(2000).max(2100),
  companyName: z.string().trim().min(2).max(200),
  inventoryBoundary: z.enum(["operational_control", "financial_control", "equity_share"]),
  consolidationApproach: z.enum(["market_based", "location_based"]).default("market_based"),
  baseYear: z.number().int().min(2000).max(2100).optional(),
  activities: z.array(ghgActivityInputSchema).min(1).max(5000),
});

export type GhgSourceScope = z.infer<typeof ghgSourceScopeSchema>;
export type GhgSourceMethod = z.infer<typeof ghgSourceMethodSchema>;
export type GhgActivityInput = z.infer<typeof ghgActivityInputSchema>;
export type GhgReportRequest = z.infer<typeof ghgReportRequestSchema>;

export type GhgActivityResult = GhgActivityInput & {
  co2eKg: number;
  co2eTons: number;
  uncertaintyKg: number;
};

export type GhgReportSummary = {
  totalCo2eKg: number;
  totalCo2eTons: number;
  scope1Kg: number;
  scope2Kg: number;
  scope3Kg: number;
  uncertaintyKg: number;
  intensityKgPerSource: number;
};

export type GhgReportOutput = {
  reportYear: number;
  companyName: string;
  generatedAt: string;
  activities: GhgActivityResult[];
  summary: GhgReportSummary;
};
