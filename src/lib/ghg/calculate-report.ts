import type {
  GhgActivityInput,
  GhgActivityResult,
  GhgReportOutput,
  GhgReportRequest,
} from "@/lib/ghg/types";

function round(value: number, precision = 6): number {
  const mult = 10 ** precision;
  return Math.round(value * mult) / mult;
}

function toActivityResult(activity: GhgActivityInput): GhgActivityResult {
  const co2eKg = round(activity.activityAmount * activity.emissionFactor);
  const co2eTons = round(co2eKg / 1000);
  const uncertaintyKg = round((co2eKg * activity.uncertaintyPct) / 100);

  return {
    ...activity,
    co2eKg,
    co2eTons,
    uncertaintyKg,
  };
}

export function calculateGhgReport(input: GhgReportRequest): GhgReportOutput {
  const activities = input.activities.map(toActivityResult);

  const scope1Kg = round(
    activities
      .filter((a) => a.scope === "scope1")
      .reduce((sum, a) => sum + a.co2eKg, 0)
  );
  const scope2Kg = round(
    activities
      .filter((a) => a.scope === "scope2")
      .reduce((sum, a) => sum + a.co2eKg, 0)
  );
  const scope3Kg = round(
    activities
      .filter((a) => a.scope === "scope3")
      .reduce((sum, a) => sum + a.co2eKg, 0)
  );
  const totalCo2eKg = round(scope1Kg + scope2Kg + scope3Kg);
  const uncertaintyKg = round(activities.reduce((sum, a) => sum + a.uncertaintyKg, 0));

  return {
    reportYear: input.reportYear,
    companyName: input.companyName,
    generatedAt: new Date().toISOString(),
    activities,
    summary: {
      totalCo2eKg,
      totalCo2eTons: round(totalCo2eKg / 1000),
      scope1Kg,
      scope2Kg,
      scope3Kg,
      uncertaintyKg,
      intensityKgPerSource: round(totalCo2eKg / Math.max(activities.length, 1)),
    },
  };
}
