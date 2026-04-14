import { z } from "zod";

const providerSchema = z.enum(["KOBiZE", "DEFRA", "IEA"]);
export type FactorProvider = z.infer<typeof providerSchema>;

const factorSchema = z.object({
  provider: providerSchema,
  year: z.number().int(),
  sourceKey: z.string(),
  sourceName: z.string(),
  scope: z.enum(["scope1", "scope2", "scope3"]),
  method: z.string(),
  activityUnit: z.string(),
  emissionFactor: z.number(),
  factorUnit: z.string(),
  sourceReference: z.string(),
});

export type OfficialEmissionFactor = z.infer<typeof factorSchema>;

const OFFICIAL_FACTORS: OfficialEmissionFactor[] = [
  {
    provider: "KOBiZE",
    year: 2025,
    sourceKey: "pl_grid_electricity_market",
    sourceName: "Energia elektryczna - Polska (market-based)",
    scope: "scope2",
    method: "purchased_electricity",
    activityUnit: "kWh",
    emissionFactor: 0.698,
    factorUnit: "kgCO2e/kWh",
    sourceReference: "KOBiZE annual factor guidance",
  },
  {
    provider: "DEFRA",
    year: 2025,
    sourceKey: "diesel_stationary",
    sourceName: "Diesel - stationary combustion",
    scope: "scope1",
    method: "stationary_combustion",
    activityUnit: "litre",
    emissionFactor: 2.687,
    factorUnit: "kgCO2e/litre",
    sourceReference: "DEFRA conversion factors",
  },
  {
    provider: "IEA",
    year: 2025,
    sourceKey: "district_heat_avg",
    sourceName: "District heat - average",
    scope: "scope2",
    method: "purchased_heat_cooling_steam",
    activityUnit: "kWh",
    emissionFactor: 0.29,
    factorUnit: "kgCO2e/kWh",
    sourceReference: "IEA emissions factors dataset",
  },
];

export function listOfficialEmissionFactors(filters?: {
  provider?: string;
  year?: number;
  scope?: string;
}) {
  return OFFICIAL_FACTORS.filter((factor) => {
    if (filters?.provider && factor.provider !== filters.provider) return false;
    if (filters?.year && factor.year !== filters.year) return false;
    if (filters?.scope && factor.scope !== filters.scope) return false;
    return true;
  });
}

export function validateOfficialFactor(input: unknown): OfficialEmissionFactor {
  return factorSchema.parse(input);
}
