import JSZip from "jszip";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

type ActivityRow = {
  sourceName: string;
  scope: "scope1" | "scope2" | "scope3";
  method: string;
  activityAmount: number;
  activityUnit: string;
  emissionFactor: number;
  emissionFactorUnit: string;
  co2eKg: number;
};

type ReportPayload = {
  reportYear: number;
  companyName: string;
  generatedAt: string;
  activities: ActivityRow[];
  summary: {
    totalCo2eKg: number;
    totalCo2eTons: number;
    scope1Kg: number;
    scope2Kg: number;
    scope3Kg: number;
    uncertaintyKg: number;
  };
};

function buildPdf(payload: ReportPayload): ArrayBuffer {
  const doc = new jsPDF();
  const lines = [
    `GHG Protocol Report - ${payload.companyName}`,
    `Year: ${payload.reportYear}`,
    `Generated at: ${payload.generatedAt}`,
    `Total CO2e: ${payload.summary.totalCo2eKg} kg`,
    `Scope 1: ${payload.summary.scope1Kg} kg`,
    `Scope 2: ${payload.summary.scope2Kg} kg`,
    `Scope 3: ${payload.summary.scope3Kg} kg`,
    `Uncertainty: ${payload.summary.uncertaintyKg} kg`,
  ];
  lines.forEach((line, index) => doc.text(line, 15, 20 + index * 8));
  return doc.output("arraybuffer");
}

function buildXlsx(payload: ReportPayload): ArrayBuffer {
  const summaryRows = [
    ["Company", payload.companyName],
    ["Year", payload.reportYear],
    ["Total CO2e (kg)", payload.summary.totalCo2eKg],
    ["Total CO2e (t)", payload.summary.totalCo2eTons],
    ["Scope 1 (kg)", payload.summary.scope1Kg],
    ["Scope 2 (kg)", payload.summary.scope2Kg],
    ["Scope 3 (kg)", payload.summary.scope3Kg],
    ["Uncertainty (kg)", payload.summary.uncertaintyKg],
  ];

  const activityRows = payload.activities.map((a) => ({
    sourceName: a.sourceName,
    scope: a.scope,
    method: a.method,
    activityAmount: a.activityAmount,
    activityUnit: a.activityUnit,
    emissionFactor: a.emissionFactor,
    emissionFactorUnit: a.emissionFactorUnit,
    co2eKg: a.co2eKg,
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summaryRows), "Summary");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(activityRows), "Activities");
  return XLSX.write(workbook, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
}

export async function buildGhgReportExportZip(payload: ReportPayload): Promise<ArrayBuffer> {
  const zip = new JSZip();
  zip.file("report.json", JSON.stringify(payload, null, 2));
  zip.file("report.pdf", buildPdf(payload));
  zip.file("report.xlsx", buildXlsx(payload));
  return zip.generateAsync({ type: "arraybuffer" });
}
