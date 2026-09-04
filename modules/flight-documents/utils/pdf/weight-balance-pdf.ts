import { format } from "date-fns";
import {
  PDFDocument,
  rgb,
  StandardFonts,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";

import type { WeightBalanceExport } from "@/modules/flight-documents/types/flight-documents-export";
import { drawSignature } from "@/modules/flight-documents/utils/pdf/pdf-signature";
import {
  fitFontSize,
  formatSheetNumber,
  pdfSafe,
  wrapText,
} from "@/modules/flight-documents/utils/pdf/pdf-text";

// US Letter, drawn from scratch to match the school's Weight and Balance
// spreadsheet form (see public/Docs/WEIGHT-AND-BALANCE.pdf): banner, load
// table, notes grid, two signature boxes, and the red/navy chevrons
// behind the lower rows.
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 36;
const CARD_X = MARGIN;
const CARD_WIDTH = PAGE_WIDTH - MARGIN * 2;
const CARD_TOP = PAGE_HEIGHT - 60;

const INK = rgb(0, 0, 0);
const BANNER = rgb(0.573, 0.706, 0.847); // #92b4d8
const NAVY = rgb(0.059, 0.161, 0.322); // #0f2952
const RED = rgb(0.89, 0.106, 0.137); // #e31b23
const RULE = 1.5;

const COLUMNS = [0.32, 0.23, 0.2, 0.25]; // load, weight, arm, moment

type Fonts = { sans: PDFFont; bold: PDFFont; italic: PDFFont; boldItalic: PDFFont; dingbats: PDFFont };

function columnEdges() {
  const edges = [CARD_X];

  for (const fraction of COLUMNS) {
    edges.push(edges[edges.length - 1] + CARD_WIDTH * fraction);
  }

  return edges;
}

function text(
  page: PDFPage,
  font: PDFFont,
  value: string,
  x: number,
  baseline: number,
  size: number,
  options: { align?: "left" | "center" | "right"; width?: number; color?: ReturnType<typeof rgb> } = {},
) {
  const clean = pdfSafe(value);

  if (!clean) {
    return;
  }

  const width = options.width ?? 0;
  const fitted = width ? fitFontSize(font, clean, width - 8, size, 6) : size;
  const textWidth = font.widthOfTextAtSize(clean, fitted);
  const align = options.align ?? "left";
  const drawX =
    align === "center"
      ? x + (width - textWidth) / 2
      : align === "right"
        ? x + width - textWidth - 6
        : x + 6;

  page.drawText(clean, {
    x: drawX,
    y: baseline,
    size: fitted,
    font,
    color: options.color ?? INK,
  });
}

function rule(page: PDFPage, x0: number, y0: number, x1: number, y1: number, thickness = RULE) {
  page.drawLine({ start: { x: x0, y: y0 }, end: { x: x1, y: y1 }, thickness, color: INK });
}

const CHECK = "✓";

// Draws `value` left-to-right, rendering every "✓" with ZapfDingbats.
// Returns nothing drawn when the text is empty.
function textWithChecks(
  page: PDFPage,
  fonts: Fonts,
  font: PDFFont,
  value: string,
  x: number,
  baseline: number,
  size: number,
  options: { align?: "left" | "center"; width?: number } = {},
) {
  const segments = value.split(CHECK);
  const measure = (segment: string, index: number) =>
    font.widthOfTextAtSize(pdfSafe(segment), size) +
    (index < segments.length - 1 ? fonts.dingbats.widthOfTextAtSize(CHECK, size) : 0);
  const total = segments.reduce((sum, segment, index) => sum + measure(segment, index), 0);
  const width = options.width ?? 0;
  let cursor =
    options.align === "center" && width ? x + (width - total) / 2 : x + 6;

  segments.forEach((segment, index) => {
    const clean = pdfSafe(segment);

    if (clean) {
      page.drawText(clean, { x: cursor, y: baseline, size, font, color: INK });
      cursor += font.widthOfTextAtSize(clean, size);
    }

    if (index < segments.length - 1) {
      page.drawText(CHECK, { x: cursor, y: baseline, size, font: fonts.dingbats, color: INK });
      cursor += fonts.dingbats.widthOfTextAtSize(CHECK, size);
    }
  });
}

function checkOption(selected: boolean, label: string) {
  return `(${selected ? CHECK : "  "}) ${label}`;
}

export async function buildWeightBalancePdf(
  sheet: WeightBalanceExport,
  into?: PDFDocument,
): Promise<PDFDocument> {
  const doc = into ?? (await PDFDocument.create());
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const fonts: Fonts = {
    sans: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    italic: await doc.embedFont(StandardFonts.HelveticaOblique),
    boldItalic: await doc.embedFont(StandardFonts.HelveticaBoldOblique),
    // The only standard font with a check mark; it takes the U+2713 code point.
    dingbats: await doc.embedFont(StandardFonts.ZapfDingbats),
  };
  const edges = columnEdges();

  // ---- table rows (data-driven per aircraft type) --------------------------
  const rows: { load: string; weight: string; arm: string; moment: string; total?: boolean }[] = [
    {
      load: "Basic Empty Weight",
      weight: formatSheetNumber(sheet.basicEmptyWeight),
      arm: formatSheetNumber(sheet.basicEmptyWeightArm),
      moment: formatSheetNumber(sheet.basicEmptyWeightMoment),
    },
    {
      load: "Usable Fuel",
      weight: formatSheetNumber(sheet.usableFuelWeight),
      arm: formatSheetNumber(sheet.usableFuelArm),
      moment: formatSheetNumber(sheet.usableFuelMoment),
    },
    {
      load: "FI + Student",
      weight: formatSheetNumber(sheet.fiAndStudentWeight),
      arm: formatSheetNumber(sheet.fiAndStudentArm),
      moment: formatSheetNumber(sheet.fiAndStudentMoment),
    },
    ...sheet.baggage.map((entry) => ({
      load: sheet.baggage.length > 1 ? `Baggage Area ${entry.position}` : "Baggage Area",
      weight: formatSheetNumber(entry.weight),
      arm: formatSheetNumber(entry.arm),
      moment: formatSheetNumber(entry.moment),
    })),
    {
      load: "Total",
      weight: formatSheetNumber(sheet.totalWeight),
      arm: sheet.totalCg !== null ? `CG: ${formatSheetNumber(sheet.totalCg)}` : "CG:",
      moment: formatSheetNumber(sheet.totalMoment),
      total: true,
    },
  ];

  const BANNER_HEIGHT = 54;
  const HEADER_ROW = 24;
  const ROW = 27;
  const LIMIT_ROW = 24;
  const NOTES_ROW = 56;
  const SIGNATURE_ROW = 78;
  const tableTop = CARD_TOP - BANNER_HEIGHT;
  const rowsBottom = tableTop - HEADER_ROW - ROW * rows.length;
  const limitsBottom = rowsBottom - LIMIT_ROW * 2;
  const notesBottom = limitsBottom - NOTES_ROW;
  const cardBottom = notesBottom - SIGNATURE_ROW;

  // ---- chevrons first so everything else paints over them ------------------
  // Template polygons live in an 800x250 box anchored to the card's bottom.
  const chevronHeight = 250 * (CARD_WIDTH / 800);
  const px = (x: number) => CARD_X + (x / 800) * CARD_WIDTH;
  const py = (yy: number) => cardBottom + (250 - yy) / 250 * chevronHeight;
  const polygon = (points: [number, number][]) =>
    `M ${points.map(([x, yy]) => `${px(x)} ${PAGE_HEIGHT - py(yy)}`).join(" L ")} Z`;

  // Text prints over these, so they stay translucent like the source form.
  page.drawSvgPath(polygon([[200, 250], [800, 40], [800, 250]]), { x: 0, y: PAGE_HEIGHT, color: NAVY, opacity: 0.38 });
  page.drawSvgPath(polygon([[0, 250], [560, 70], [800, 250]]), { x: 0, y: PAGE_HEIGHT, color: RED, opacity: 0.38 });

  // ---- banner --------------------------------------------------------------
  page.drawRectangle({ x: CARD_X, y: tableTop, width: CARD_WIDTH, height: BANNER_HEIGHT, color: BANNER });
  const col1 = CARD_X;
  const col2 = CARD_X + CARD_WIDTH * 0.485;
  const col3 = CARD_X + CARD_WIDTH * 0.73;
  rule(page, col2, tableTop, col2, CARD_TOP);
  rule(page, col3, tableTop, col3, CARD_TOP);

  const title = sheet.aircraftTypeName.toUpperCase();
  text(page, fonts.bold, title, col1 + 8, CARD_TOP - 26, fitFontSize(fonts.bold, title, col2 - col1 - 24, 22, 12));
  text(page, fonts.bold, "WEIGHT AND BALANCE", col1 + 8, CARD_TOP - 44, 11);

  text(page, fonts.bold, "RP-C:", col2 + 8, CARD_TOP - 34, 13);
  const registration = sheet.registrationMark.replace(/^RP-?C-?/i, "");
  text(page, fonts.bold, registration, col2 + 52, CARD_TOP - 36, fitFontSize(fonts.bold, registration, col3 - col2 - 70, 20, 10));

  text(page, fonts.bold, "Date:", col3 + 8, CARD_TOP - 24, 11);
  text(page, fonts.boldItalic, "(dd/mm/yyyy)", col3 + 8, CARD_TOP - 38, 8, { color: rgb(0.725, 0.11, 0.11) });
  const dateX = col3 + 64;
  text(page, fonts.bold, format(new Date(sheet.date), "dd/MM/yyyy"), dateX, CARD_TOP - 36, 15, {
    width: CARD_X + CARD_WIDTH - dateX,
  });

  // ---- table header --------------------------------------------------------
  const headerBaseline = tableTop - HEADER_ROW + 8;
  ["LOAD", "WEIGHT (lbs)", "ARM (in)", "MOMENT (lbs-in)"].forEach((label, index) => {
    text(page, fonts.bold, label, edges[index], headerBaseline, 11, { align: "center", width: edges[index + 1] - edges[index] });
  });

  // ---- table rows ----------------------------------------------------------
  rows.forEach((row, index) => {
    const rowTop = tableTop - HEADER_ROW - ROW * index;
    const baseline = rowTop - ROW + 9;

    const font = row.total ? fonts.bold : fonts.sans;
    text(page, fonts.bold, row.load, edges[0], baseline, 11);
    text(page, font, row.weight, edges[1], baseline, 11, { align: "center", width: edges[2] - edges[1] });

    text(page, row.total ? fonts.bold : font, row.arm, edges[2], baseline, 11, { align: "center", width: edges[3] - edges[2] });
    text(page, font, row.moment, edges[3], baseline, 11, { align: "center", width: edges[4] - edges[3] });
  });

  // ---- limits rows ---------------------------------------------------------
  const weightRowTop = rowsBottom;
  const balanceRowTop = rowsBottom - LIMIT_ROW;
  textWithChecks(page, fonts, fonts.bold, `Weight (${CHECK})`, edges[0], weightRowTop - LIMIT_ROW + 8, 10);
  textWithChecks(page, fonts, fonts.bold, `Balance (${CHECK})`, edges[0], balanceRowTop - LIMIT_ROW + 8, 10);

  const spanX = edges[1];
  const spanWidth = edges[4] - edges[1];
  const weightOptions = [
    checkOption(sheet.weightStatus === "within_limits", "within limits"),
    checkOption(sheet.weightStatus === "overweight", "overweight"),
  ];
  weightOptions.forEach((label, index) => {
    textWithChecks(page, fonts, fonts.italic, label, spanX + (spanWidth / 2) * index, weightRowTop - LIMIT_ROW + 8, 10, { align: "center", width: spanWidth / 2 });
  });
  const balanceOptions = [
    checkOption(sheet.balanceStatus === "balanced", "balanced"),
    checkOption(sheet.balanceStatus === "nose_heavy", "nose heavy"),
    checkOption(sheet.balanceStatus === "tail_heavy", "tail heavy"),
  ];
  balanceOptions.forEach((label, index) => {
    textWithChecks(page, fonts, fonts.italic, label, spanX + (spanWidth / 3) * index, balanceRowTop - LIMIT_ROW + 8, 10, { align: "center", width: spanWidth / 3 });
  });

  // ---- notes grid ----------------------------------------------------------
  const notesTop = limitsBottom;
  const notesMidX = CARD_X + CARD_WIDTH * 0.32;
  const notesRightX = CARD_X + CARD_WIDTH * 0.75;
  const notesSplitY = notesTop - NOTES_ROW * 0.45;
  text(page, fonts.bold, "Notes:", CARD_X, notesTop - NOTES_ROW / 2 - 4, 11);
  text(
    page,
    fonts.boldItalic,
    `Baggage Area Max Weight: ${formatSheetNumber(sheet.maxBaggageWeight)} LBS`,
    notesMidX,
    notesSplitY + 8,
    9.5,
    { align: "center", width: notesRightX - notesMidX },
  );
  text(page, fonts.boldItalic, "CG: Total Moment/Total Weight", notesMidX, notesBottom + 11, 9.5, { align: "center", width: notesRightX - notesMidX });
  text(
    page,
    fonts.boldItalic,
    `MTOW: ${formatSheetNumber(sheet.maximumTakeoffWeight)} lbs`,
    notesRightX,
    notesSplitY + 8,
    10,
    { align: "center", width: CARD_X + CARD_WIDTH - notesRightX },
  );
  const notice = wrapText(fonts.boldItalic, "Check with POH, PIC is responsible for ensuring calculations are correct", CARD_X + CARD_WIDTH - notesRightX - 12, 7.5);
  notice.slice(0, 3).forEach((line, index) => {
    text(page, fonts.boldItalic, line, notesRightX, notesBottom + 22 - index * 8.5, 7.5, { align: "center", width: CARD_X + CARD_WIDTH - notesRightX });
  });

  // ---- signatures ----------------------------------------------------------
  const sigTop = notesBottom;
  const sigMidX = CARD_X + CARD_WIDTH / 2;
  const signatureBoxes = [
    { x0: CARD_X, x1: sigMidX, title: "Prepared by:", name: sheet.preparedByName, svg: sheet.preparedBySignatureSvg, caption: "Student Trainee (Name & Signature)" },
    { x0: sigMidX, x1: CARD_X + CARD_WIDTH, title: "Verified by:", name: sheet.verifiedByName, svg: sheet.verifiedBySignatureSvg, caption: "Flight Instructor/Safety Officer (Name & Signature)" },
  ];

  for (const sig of signatureBoxes) {
    const width = sig.x1 - sig.x0;
    text(page, fonts.boldItalic, sig.title, sig.x0 + 2, sigTop - 14, 10);
    drawSignature(page, sig.svg, { x: sig.x0 + width * 0.3, top: sigTop - 14, width: width * 0.4, height: 30 });
    text(page, fonts.bold, sig.name ?? "", sig.x0, cardBottom + 22, 12, { align: "center", width });
    text(page, fonts.italic, sig.caption, sig.x0, cardBottom + 8, 8.5, { align: "center", width });
  }

  // ---- grid lines (after fills so they stay crisp) --------------------------
  rule(page, CARD_X, cardBottom, CARD_X, CARD_TOP, 2);
  rule(page, CARD_X + CARD_WIDTH, cardBottom, CARD_X + CARD_WIDTH, CARD_TOP, 2);
  rule(page, CARD_X, CARD_TOP, CARD_X + CARD_WIDTH, CARD_TOP, 2);
  rule(page, CARD_X, cardBottom, CARD_X + CARD_WIDTH, cardBottom, 2);
  rule(page, CARD_X, tableTop, CARD_X + CARD_WIDTH, tableTop, 2);

  for (let index = 0; index <= rows.length; index++) {
    const lineY = tableTop - HEADER_ROW - ROW * index;
    rule(page, CARD_X, lineY, CARD_X + CARD_WIDTH, lineY);
  }
  rule(page, CARD_X, balanceRowTop, CARD_X + CARD_WIDTH, balanceRowTop);
  rule(page, CARD_X, limitsBottom, CARD_X + CARD_WIDTH, limitsBottom);
  rule(page, CARD_X, notesBottom, CARD_X + CARD_WIDTH, notesBottom);

  for (let column = 1; column < edges.length - 1; column++) {
    rule(page, edges[column], rowsBottom, edges[column], tableTop);
  }
  rule(page, edges[1], limitsBottom, edges[1], rowsBottom);
  rule(page, notesMidX, notesBottom, notesMidX, notesTop);
  rule(page, notesRightX, notesBottom, notesRightX, notesTop);
  rule(page, notesMidX, notesSplitY, CARD_X + CARD_WIDTH, notesSplitY);
  rule(page, sigMidX, cardBottom, sigMidX, notesBottom);

  return doc;
}
