import type { jsPDF } from "jspdf";

import { PDF_TIMES_FONT } from "@/lib/jspdf-polish";
import { SITE_URL } from "@/lib/site";

export { SITE_URL };

export type FontWeight = "normal" | "bold";

/**
 * Układ A4 w stylu formalnego pisma urzędowego (czytelny druk, spójne marginesy).
 * Marginesy zbliżone do często stosowanych w dokumentach składanych do organów (~25 mm).
 */
export const PDF = {
  marginX: 25,
  marginY: 22,
  pageW: 210,
  pageH: 297,
  get contentW() {
    return this.pageW - 2 * this.marginX;
  },
};

/** Treść: korpus pisma; nagłówki: nieco ciemniejsze. */
const COLOR_BODY: [number, number, number] = [16, 16, 18];
const COLOR_TITLE: [number, number, number] = [8, 8, 10];
const COLOR_MUTED: [number, number, number] = [88, 90, 96];

/** Ustawia czcionkę treści (Times New Roman — Liberation Serif z createPolishPdf). */
export function setBodyFont(doc: jsPDF): void {
  doc.setFont(PDF_TIMES_FONT, "normal");
  doc.setTextColor(...COLOR_BODY);
}

/** Nowa strona, jeśli brakuje miejsca (mm od góry). */
export function ensureSpace(
  doc: jsPDF,
  y: number,
  neededMm: number
): number {
  const bottom = PDF.pageH - PDF.marginY;
  if (y + neededMm > bottom) {
    doc.addPage();
    setBodyFont(doc);
    return PDF.marginY + 6;
  }
  return y;
}

/** Tytuł dokumentu — wyśrodkowany, jak nagłówek druku urzędowego. */
export function writeDocTitle(
  doc: jsPDF,
  lines: string[],
  y: number,
  fontSize = 13,
  afterGap = 8,
  bold = false
): number {
  doc.setFont(PDF_TIMES_FONT, bold ? "bold" : "normal");
  doc.setTextColor(...COLOR_TITLE);
  let yy = y;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const size = bold
      ? i === 0
        ? fontSize
        : Math.max(10, fontSize - 1)
      : i === 0
        ? fontSize
        : Math.max(9.5, fontSize - 1.25);
    const lineStep = size * 0.56;
    doc.setFontSize(size);
    doc.text(line, PDF.pageW / 2, yy, { align: "center" });
    yy += lineStep + (i === 0 ? 1.2 : 0.8);
  }
  doc.setFont(PDF_TIMES_FONT, "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_BODY);
  return yy + afterGap;
}

/** Opcje zagęszczenia nagłówka sekcji (np. wniosek z punktami I, II, III). */
export type SectionHeadingSpacing = {
  gapBefore?: number;
  gapAfter?: number;
};

/** Nagłówek sekcji — wyraźny, z dodatkową przestrzenią pod spodem. */
export function writeSectionHeading(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  fontSize = 11,
  spacing?: SectionHeadingSpacing
): number {
  const gapBefore = spacing?.gapBefore ?? 3.5;
  const gapAfter = spacing?.gapAfter ?? 3.5;
  const spaceBefore = y > PDF.marginY + 2 ? gapBefore : 0;
  let yy = ensureSpace(doc, y, spaceBefore + 22);
  yy += spaceBefore;
  setBodyFont(doc);
  doc.setFontSize(fontSize);
  doc.setTextColor(...COLOR_TITLE);
  doc.text(text, x, yy);
  doc.setTextColor(...COLOR_BODY);
  return yy + fontSize * 0.62 + gapAfter;
}

/** Wyrównanie akapitu — `center` przydatne m.in. w umowach. */
export type ParagraphAlign = "left" | "center";

/** Akapit z zawijaniem — zwraca nową pozycję Y pod blokiem tekstu. */
export function writeParagraph(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize = 10,
  lineHeightFactor = 1.5,
  align: ParagraphAlign = "left",
  trailingGap = 6.5,
  fontWeight: FontWeight = "normal"
): number {
  doc.setFont(PDF_TIMES_FONT, fontWeight);
  doc.setTextColor(...COLOR_BODY);
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  const lineCount = Math.max(1, lines.length);
  const lineStep = fontSize * 0.52 * lineHeightFactor;
  if (align === "center") {
    doc.text(lines, PDF.pageW / 2, y, {
      align: "center",
      lineHeightFactor,
    });
  } else {
    doc.text(lines, x, y, { lineHeightFactor });
  }
  doc.setFont(PDF_TIMES_FONT, "normal");
  return y + lineCount * lineStep + trailingGap;
}

/** Akapit z kontrolą łamania strony (szacunek wysokości). */
export function writeParagraphFlow(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize = 10,
  lineHeightFactor = 1.5,
  align: ParagraphAlign = "left",
  trailingGap = 6.5,
  fontWeight: FontWeight = "normal"
): number {
  doc.setFont(PDF_TIMES_FONT, fontWeight);
  doc.setTextColor(...COLOR_BODY);
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  const lineCount = Math.max(1, lines.length);
  const estH = lineCount * fontSize * 0.52 * lineHeightFactor + trailingGap + 8;
  let yy = ensureSpace(doc, y, estH);
  return writeParagraph(
    doc,
    text,
    x,
    yy,
    maxWidth,
    fontSize,
    lineHeightFactor,
    align,
    trailingGap,
    fontWeight
  );
}

/** Kratka do odhaczenia przy pozycji checklisty — rysowany kwadrat + tekst z zawijaniem. */
const CHECKLIST_BOX_MM = 4;
const CHECKLIST_BOX_GAP_MM = 2.5;

export function writeChecklistItem(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  rowWidth: number,
  fontSize = 10,
  lineHeightFactor = 1.5
): number {
  const textX = x + CHECKLIST_BOX_MM + CHECKLIST_BOX_GAP_MM;
  const textW = Math.max(20, rowWidth - CHECKLIST_BOX_MM - CHECKLIST_BOX_GAP_MM);
  setBodyFont(doc);
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(text, textW) as string[];
  const lineCount = Math.max(1, lines.length);
  const lineStep = fontSize * 0.52 * lineHeightFactor;
  const estH = lineCount * lineStep + 14 + 4;
  let yy = ensureSpace(doc, y, estH);

  const boxTop = yy - 3.5;
  doc.setDrawColor(72, 74, 82);
  doc.setLineWidth(0.35);
  doc.rect(x, boxTop, CHECKLIST_BOX_MM, CHECKLIST_BOX_MM);
  doc.setLineWidth(0.25);

  doc.text(lines, textX, yy, { lineHeightFactor });
  return yy + lineCount * lineStep + 6.5;
}

/** Prawy górny róg: „Miejscowość i data: …” (jak w pismach formalnych). */
export function writeDatePlaceTopRight(
  doc: jsPDF,
  city: string,
  dateStr: string
): void {
  setBodyFont(doc);
  doc.setFontSize(9.5);
  doc.setTextColor(...COLOR_MUTED);
  const t = `Miejscowość i data: ${city}, ${dateStr}`;
  doc.text(t, PDF.pageW - PDF.marginX, PDF.marginY, { align: "right" });
  doc.setTextColor(...COLOR_BODY);
  doc.setFontSize(10);
}

/** Blok podpisu wyrównany do prawej krawędzi treści (np. oświadczenie). */
export function writeSignatureBlockRight(
  doc: jsPDF,
  y: number,
  lines: string[],
  fontSize = 9,
  lineHeightFactor = 1.35
): number {
  const xRight = PDF.pageW - PDF.marginX;
  setBodyFont(doc);
  doc.setFontSize(fontSize);
  doc.setTextColor(...COLOR_BODY);
  const lineStep = fontSize * 0.52 * lineHeightFactor;
  let yy = y + 1;
  for (let i = 0; i < lines.length; i++) {
    doc.text(lines[i]!, xRight, yy, { align: "right" });
    yy += lineStep + (i < lines.length - 1 ? 0.6 : 0);
  }
  doc.setFontSize(10);
  return yy + 6;
}

/** Linia pozioma — dyskretny separator sekcji. */
export function writeRule(doc: jsPDF, y: number): number {
  doc.setDrawColor(190, 192, 198);
  doc.setLineWidth(0.25);
  doc.line(PDF.marginX, y, PDF.pageW - PDF.marginX, y);
  return y + 6;
}

/** Rezerwuje miejsce nad stopką — ewentualnie nowa strona, żeby treść nie nachodziła. */
export function ensureSpaceForBottomDisclaimer(
  doc: jsPDF,
  y: number,
  disclaimerText: string,
  footerFontSize = 7
): number {
  setBodyFont(doc);
  const lineHeightFactor = 1.35;
  doc.setFontSize(footerFontSize);
  const lines = doc.splitTextToSize(disclaimerText, PDF.contentW) as string[];
  const lineStep = footerFontSize * 0.52 * lineHeightFactor;
  const lastLineBaseline = PDF.pageH - 9 - 5;
  const firstLineY = lastLineBaseline - (lines.length - 1) * lineStep;
  const minContentEndY = firstLineY - 4;
  doc.setFontSize(10);
  if (y > minContentEndY) {
    doc.addPage();
    setBodyFont(doc);
    return PDF.marginY + 6;
  }
  return y;
}

/** Stopka ostatniej strony — drobniejszy tekst nad numeracją stron. */
export function writeBottomDisclaimer(
  doc: jsPDF,
  text: string,
  footerFontSize = 7,
  gapAbovePageNum = 5
): void {
  const total = doc.getNumberOfPages();
  doc.setPage(total);
  setBodyFont(doc);
  const lineHeightFactor = 1.35;
  doc.setFontSize(footerFontSize);
  doc.setTextColor(...COLOR_MUTED);
  const lines = doc.splitTextToSize(text, PDF.contentW) as string[];
  const lineStep = footerFontSize * 0.52 * lineHeightFactor;
  const pageNumBaseline = PDF.pageH - 9;
  const lastLineBaseline = pageNumBaseline - gapAbovePageNum;
  const firstLineY = lastLineBaseline - (lines.length - 1) * lineStep;
  doc.text(lines, PDF.marginX, firstLineY, { lineHeightFactor });
  doc.setTextColor(...COLOR_BODY);
  doc.setFontSize(10);
}

/** Numery stron — stonowana stopka jak w dokumentacji formalnej. */
export function addPageNumbers(doc: jsPDF): void {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    setBodyFont(doc);
    doc.setFontSize(8.5);
    doc.setTextColor(...COLOR_MUTED);
    doc.text(`Strona ${i} z ${total}`, PDF.pageW / 2, PDF.pageH - 9, {
      align: "center",
    });
    doc.setTextColor(...COLOR_BODY);
  }
}

/** Metadane PDF (tytuł w przeglądarce / czytniku). */
export function setMeta(
  doc: jsPDF,
  opts: { title: string; subject?: string }
): void {
  doc.setProperties({
    title: opts.title,
    subject: opts.subject ?? opts.title,
    creator: "najembezkary.pl",
    keywords: "rejestr, najem krótkoterminowy, dokumenty",
  });
}
