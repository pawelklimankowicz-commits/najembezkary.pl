import fs from "fs";
import path from "path";

import { jsPDF } from "jspdf";

/**
 * Times New Roman — osadzamy Liberation Serif (OFL), metrycznie zgodny z Times New Roman
 * i powszechnie stosowany zamiennik w dokumentach urzędowych. Pełny polski Unicode.
 * Plik: public/fonts/LiberationSerif-Regular.ttf · licencja: public/fonts/LICENSE-LiberationSerif.txt
 */
const FONT_VFS_NAME = "LiberationSerif-Regular.ttf";
const FONT_VFS_BOLD = "LiberationSerif-Bold.ttf";

/** Nazwa rodziny w jsPDF — odpowiednik Times New Roman w wygenerowanym PDF. */
export const PDF_TIMES_FONT = "TimesNewRoman";

let cachedBase64: string | null = null;
let cachedBoldBase64: string | null = null;

function loadFontBase64(): string {
  if (cachedBase64) return cachedBase64;
  const fontPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    FONT_VFS_NAME
  );
  if (!fs.existsSync(fontPath)) {
    throw new Error(
      `Brak pliku czcionki: ${fontPath}. Uruchom projekt z katalogu głównego repozytorium.`
    );
  }
  cachedBase64 = fs.readFileSync(fontPath).toString("base64");
  return cachedBase64;
}

function loadBoldFontBase64(): string {
  if (cachedBoldBase64) return cachedBoldBase64;
  const fontPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    FONT_VFS_BOLD
  );
  if (!fs.existsSync(fontPath)) {
    throw new Error(
      `Brak pliku czcionki pogrubionej: ${fontPath}. Dodaj LiberationSerif-Bold.ttf do public/fonts/.`
    );
  }
  cachedBoldBase64 = fs.readFileSync(fontPath).toString("base64");
  return cachedBoldBase64;
}

/** jsPDF z osadzoną czcionką szeryfową (Times New Roman / Liberation Serif). */
export function createPolishPdf(): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });
  doc.addFileToVFS(FONT_VFS_NAME, loadFontBase64());
  doc.addFont(FONT_VFS_NAME, PDF_TIMES_FONT, "normal");
  doc.addFileToVFS(FONT_VFS_BOLD, loadBoldFontBase64());
  doc.addFont(FONT_VFS_BOLD, PDF_TIMES_FONT, "bold");
  doc.setFont(PDF_TIMES_FONT, "normal");
  doc.setFontSize(10);
  return doc;
}
