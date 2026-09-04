import {
  degrees,
  PDFDocument,
  rgb,
  StandardFonts,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";

import type { FlightPlanExport } from "@/modules/flight-documents/types/flight-documents-export";
import { formatLicenseLine } from "@/modules/flight-documents/utils/format-license-line";
import { drawSignature } from "@/modules/flight-documents/utils/pdf/pdf-signature";
import {
  fitFontSize,
  pdfSafe,
  wrapToRows,
} from "@/modules/flight-documents/utils/pdf/pdf-text";

// The official CAAP Form ATS 2019-1 (page 1) with its back-page guidance
// (page 2), extracted from public/Docs/FLIGHT-PLAN-FORMAT.pdf.
export const CAAP_FLIGHT_PLAN_FORM_URL = "/forms/caap-form-ats-2019-1.pdf";

// Page is 612 x 1008 pt (8.5" x 14"). Every coordinate below was read off
// the form's own vector geometry with the origin at the TOP-left, the way
// design tools report it; `y()` flips into PDF space.
const PAGE_HEIGHT = 1008;
const INK = rgb(0.05, 0.05, 0.05);

type Box = { x0: number; x1: number; top: number; bottom: number };

const box = (x0: number, x1: number, top: number, bottom: number): Box => ({
  x0,
  x1,
  top,
  bottom,
});

// Comb fields: the x positions of the cell dividers, first and last being
// the box edges.
const COMBS = {
  dof: { cells: [48.3, 63.8, 79.2, 95.7, 112.6, 129.3, 146.1], top: 164.3, bottom: 177.0 },
  originator: { cells: [174.3, 186.5, 200.2, 213.3, 228.9, 244.4, 258.9, 273.5, 283.4], top: 164.3, bottom: 177.0 },
  aircraftId: { cells: [181.6, 196.8, 215.4, 234.2, 252.8, 272.9, 292.6, 308.9], top: 222.8, bottom: 242.3 },
  typeOfAircraft: { cells: [109.1, 121.2, 135.8, 150.8, 162.1], top: 253.8, bottom: 273.8 },
  departure: { cells: [103.8, 119.7, 137.1, 154.5, 170.6], top: 284.8, bottom: 301.3 },
  departureTime: { cells: [247.1, 261.3, 280.2, 298.3, 312.4], top: 284.8, bottom: 301.3 },
  speed: { cells: [56.0, 70.2, 87.0, 104.5, 123.2, 138.8], top: 312.3, bottom: 326.1 },
  level: { cells: [155.3, 167.7, 183.0, 196.8, 209.6, 223.9], top: 312.3, bottom: 326.1 },
  destination: { cells: [67.3, 84.3, 103.8, 121.6, 137.8], top: 398.8, bottom: 417.8 },
  totalEet: { cells: [193.1, 208.1, 224.0, 239.0, 253.6], top: 398.8, bottom: 417.8 },
  alternate: { cells: [303.9, 321.0, 340.1, 358.7, 375.7], top: 398.8, bottom: 417.8 },
  secondAlternate: { cells: [443.4, 463.0, 484.1, 505.2, 522.0], top: 398.8, bottom: 417.8 },
  endurance: { cells: [92.3, 107.0, 121.6, 137.8, 154.2], top: 522.0, bottom: 541.1 },
  personsOnBoard: { cells: [209.9, 234.7, 265.8, 291.0], top: 522.0, bottom: 541.1 },
  dinghiesNumber: { cells: [92.4, 107.7, 124.2], top: 620.5, bottom: 639.6 },
  dinghiesCapacity: { cells: [138.7, 154.4, 173.1, 188.9], top: 620.5, bottom: 639.6 },
} as const;

const BOXES = {
  addressee1: box(131.1, 591.8, 109.8, 120.0),
  addressee2: box(131.1, 591.8, 120.0, 131.5),
  flightRules: box(380.4, 403.2, 222.8, 242.3),
  typeOfFlight: box(495.5, 518.5, 222.8, 242.3),
  numberOfAircraft: box(73.8, 94.3, 253.8, 273.8),
  wake: box(200.1, 216.6, 253.8, 273.8),
  // Item 10 has a pre-printed "/" at x≈410.7: COM/NAV left, surveillance right.
  comNav: box(309.4, 406.0, 253.8, 273.8),
  surveillance: box(416.0, 518.5, 253.8, 273.8),
  route1: box(244.1, 591.5, 312.3, 326.1),
  route2: box(24.0, 591.8, 326.1, 337.6),
  route3: box(24.0, 591.8, 337.6, 349.1),
  route4: box(24.0, 523.0, 349.1, 361.1),
  other1: box(58.5, 591.7, 428.6, 447.6),
  other2: box(24.0, 591.8, 447.6, 459.1),
  other3: box(24.0, 591.8, 459.1, 470.6),
  other4: box(24.0, 505.7, 470.6, 488.4),
  dinghiesColour: box(244.6, 375.8, 620.5, 639.6),
  colourMarkings: box(82.1, 591.5, 661.6, 680.6),
  remarks: box(85.9, 520.8, 692.0, 711.0),
  pilotInCommand: box(85.9, 375.8, 731.6, 750.7),
} as const;

// Item 19 indicator boxes. ICAO practice (and the sample in the source
// PDF): an indicator is CROSSED OUT when that equipment is NOT carried /
// available, and left untouched when it is.
const INDICATORS = {
  radioUhf: box(435.9, 457.8, 522.0, 541.1),
  radioVhf: box(481.8, 503.6, 522.0, 541.1),
  radioElt: box(527.9, 548.9, 522.0, 541.1),
  survival: box(68.6, 92.3, 561.4, 585.2),
  survivalPolar: box(113.3, 138.7, 561.4, 579.9),
  survivalDesert: box(170.1, 193.9, 561.4, 579.9),
  survivalMaritime: box(225.1, 246.1, 561.4, 579.9),
  survivalJungle: box(272.8, 297.4, 561.4, 579.9),
  jackets: box(337.5, 358.5, 561.4, 579.9),
  jacketLight: box(394.8, 415.8, 561.4, 579.9),
  jacketFluorescent: box(435.9, 456.9, 561.4, 579.9),
  jacketUhf: box(481.8, 503.6, 561.4, 579.9),
  jacketVhf: box(527.9, 548.9, 561.4, 579.9),
  dinghies: box(54.0, 75.0, 620.5, 645.0),
  dinghiesCover: box(204.6, 225.1, 620.5, 639.6),
  remarksN: box(54.0, 75.0, 686.5, 714.0),
} as const;

// Signature block: four columns above the underscored lines (baseline of
// the line text ≈ 862 from the top; captions start at 866).
const SIGNATURE_LINE_TOP = 861;
const SIGNATURE_COLUMNS = {
  pilot: { x0: 29, x1: 140 },
  pilotLicense: { x0: 150, x1: 290 },
  representative: { x0: 305, x1: 458 },
  representativeLicense: { x0: 466, x1: 590 },
} as const;

const y = (topLeftY: number) => PAGE_HEIGHT - topLeftY;

type Fonts = { mono: PDFFont; sans: PDFFont; sansBold: PDFFont };

function baselineFor(top: number, bottom: number, size: number) {
  // Vertically centre a cap-height-ish glyph inside the box.
  return y(bottom) + (bottom - top - size * 0.72) / 2;
}

function drawBoxText(
  page: PDFPage,
  font: PDFFont,
  text: string,
  target: Box,
  options: { align?: "left" | "center" | "right"; size?: number; pad?: number } = {},
) {
  const clean = pdfSafe(text).trim();

  if (!clean) {
    return;
  }

  const pad = options.pad ?? 3;
  const width = target.x1 - target.x0 - pad * 2;
  const size = fitFontSize(font, clean, width, options.size ?? 10);
  const textWidth = font.widthOfTextAtSize(clean, size);
  const align = options.align ?? "left";
  const x =
    align === "left"
      ? target.x0 + pad
      : align === "right"
        ? target.x1 - pad - textWidth
        : target.x0 + (target.x1 - target.x0 - textWidth) / 2;

  page.drawText(clean, {
    x,
    y: baselineFor(target.top, target.bottom, size),
    size,
    font,
    color: INK,
  });
}

function drawComb(
  page: PDFPage,
  font: PDFFont,
  text: string,
  comb: { cells: readonly number[]; top: number; bottom: number },
) {
  const chars = Array.from(pdfSafe(text).toUpperCase());
  const size = Math.min(11, (comb.bottom - comb.top) * 0.62);

  chars.slice(0, comb.cells.length - 1).forEach((char, index) => {
    const x0 = comb.cells[index];
    const x1 = comb.cells[index + 1];
    const width = font.widthOfTextAtSize(char, size);

    page.drawText(char, {
      x: x0 + (x1 - x0 - width) / 2,
      y: baselineFor(comb.top, comb.bottom, size),
      size,
      font,
      color: INK,
    });
  });
}

// Flows text across the printed rows of a multi-row field. Item 18 is an
// ICAO sequence of "INDICATOR/ value" groups, so the app's one-entry-per-
// line storage is flattened to spaces and wrapped like a paragraph — the
// form has only four rows, and a plan with DOF/ DEP/ DEST/ ALTN/ RMK/ must
// still print every group. Each row uses its own width (row 1 starts
// further right), and the font shrinks until everything fits.
function drawLines(
  page: PDFPage,
  font: PDFFont,
  text: string,
  targets: readonly Box[],
  preferredSize = 9.5,
) {
  const clean = pdfSafe(text).replace(/\s*\n\s*/g, " ").trim();

  if (!clean) {
    return;
  }

  const widths = targets.map((target) => target.x1 - target.x0 - 6);
  let size = preferredSize;
  let wrapped = wrapToRows(font, clean, widths, size);

  while (wrapped.overflow && size > 5.5) {
    size -= 0.5;
    wrapped = wrapToRows(font, clean, widths, size);
  }

  wrapped.rows.forEach((row, index) => {
    // drawBoxText fits the row to its box, so a still-overflowing last
    // row squeezes rather than vanishes.
    drawBoxText(page, font, row, targets[index], { size, pad: 3 });
  });
}

// An "X" across an indicator box.
function crossOut(page: PDFPage, target: Box) {
  const inset = 3;
  const options = { thickness: 1.2, color: INK };

  page.drawLine({
    start: { x: target.x0 + inset, y: y(target.top + inset) },
    end: { x: target.x1 - inset, y: y(target.bottom - inset) },
    ...options,
  });
  page.drawLine({
    start: { x: target.x0 + inset, y: y(target.bottom - inset) },
    end: { x: target.x1 - inset, y: y(target.top + inset) },
    ...options,
  });
}

function drawSignatureColumn(
  page: PDFPage,
  fonts: Fonts,
  column: { x0: number; x1: number },
  name: string | null,
  signatureSvg: string | null,
) {
  if (!name) {
    return;
  }

  const width = column.x1 - column.x0;
  const drewSignature = drawSignature(page, signatureSvg, {
    x: column.x0,
    top: y(SIGNATURE_LINE_TOP - 28),
    width,
    height: 26,
  });

  const label = pdfSafe(name);
  const size = fitFontSize(fonts.sans, label, width, 7, 5);

  page.drawText(label, {
    x: column.x0 + (width - fonts.sans.widthOfTextAtSize(label, size)) / 2,
    y: y(SIGNATURE_LINE_TOP - (drewSignature ? 1 : 10)),
    size,
    font: fonts.sans,
    color: INK,
  });
}

function drawSmallLine(
  page: PDFPage,
  font: PDFFont,
  text: string,
  column: { x0: number; x1: number },
) {
  const clean = pdfSafe(text).trim();

  if (!clean) {
    return;
  }

  const width = column.x1 - column.x0;
  const size = fitFontSize(font, clean, width, 7, 4.5);

  page.drawText(clean, {
    x: column.x0,
    y: y(SIGNATURE_LINE_TOP - 2),
    size,
    font,
    color: INK,
  });
}

// Fills the official form in place. Returns the document holding the
// filled front page and the untouched back page.
export async function buildFlightPlanPdf(
  formBytes: ArrayBuffer,
  flightPlan: FlightPlanExport,
): Promise<PDFDocument> {
  const doc = await PDFDocument.load(formBytes);
  const page = doc.getPage(0);
  const fonts: Fonts = {
    mono: await doc.embedFont(StandardFonts.CourierBold),
    sans: await doc.embedFont(StandardFonts.Helvetica),
    sansBold: await doc.embedFont(StandardFonts.HelveticaBold),
  };
  const values = flightPlan.values;

  // Addressee / filing block
  drawLines(page, fonts.mono, values.addressee, [BOXES.addressee1, BOXES.addressee2], 8.5);
  drawComb(page, fonts.mono, values.dofRaw, COMBS.dof);
  drawComb(page, fonts.mono, values.originator, COMBS.originator);

  // Items 7–10
  drawComb(page, fonts.mono, flightPlan.aircraftIdentification.replace(/[^A-Za-z0-9]/g, ""), COMBS.aircraftId);
  drawBoxText(page, fonts.mono, values.flightRules, BOXES.flightRules, { align: "center", size: 11 });
  drawBoxText(page, fonts.mono, values.typeOfFlight, BOXES.typeOfFlight, { align: "center", size: 11 });
  drawBoxText(page, fonts.mono, values.numberOfAircraft, BOXES.numberOfAircraft, { align: "center", size: 11 });
  drawComb(page, fonts.mono, flightPlan.aircraftTypeDesignator, COMBS.typeOfAircraft);
  drawBoxText(page, fonts.mono, values.wakeTurbulenceCategory, BOXES.wake, { align: "center", size: 11 });
  drawBoxText(page, fonts.mono, values.comNavEquipment, BOXES.comNav, { align: "right", size: 11 });
  drawBoxText(page, fonts.mono, values.surveillanceEquipment, BOXES.surveillance, { align: "left", size: 11 });

  // Items 13–16
  drawComb(page, fonts.mono, values.departureAerodrome, COMBS.departure);
  drawComb(page, fonts.mono, values.departureTimeRaw, COMBS.departureTime);
  drawComb(page, fonts.mono, values.cruisingSpeed, COMBS.speed);
  drawComb(page, fonts.mono, values.cruisingLevel, COMBS.level);
  drawLines(page, fonts.mono, values.route, [BOXES.route1, BOXES.route2, BOXES.route3, BOXES.route4], 9.5);
  drawComb(page, fonts.mono, values.destinationAerodrome, COMBS.destination);
  drawComb(page, fonts.mono, values.totalEet, COMBS.totalEet);
  drawComb(page, fonts.mono, values.firstAlternateAerodrome, COMBS.alternate);
  drawComb(page, fonts.mono, values.secondAlternateAerodrome, COMBS.secondAlternate);

  // Item 18 — one entry per line as the app stores it.
  drawLines(page, fonts.mono, values.otherRemarks, [BOXES.other1, BOXES.other2, BOXES.other3, BOXES.other4], 9);

  // Item 19
  drawComb(page, fonts.mono, values.endurance, COMBS.endurance);
  drawComb(page, fonts.mono, values.personsOnBoard, COMBS.personsOnBoard);

  if (!values.emergencyRadioUhf) crossOut(page, INDICATORS.radioUhf);
  if (!values.emergencyRadioVhf) crossOut(page, INDICATORS.radioVhf);
  if (!values.emergencyRadioElt) crossOut(page, INDICATORS.radioElt);

  const hasSurvival =
    values.survivalPolar || values.survivalDesert || values.survivalMaritime || values.survivalJungle;
  if (!hasSurvival) crossOut(page, INDICATORS.survival);
  if (!values.survivalPolar) crossOut(page, INDICATORS.survivalPolar);
  if (!values.survivalDesert) crossOut(page, INDICATORS.survivalDesert);
  if (!values.survivalMaritime) crossOut(page, INDICATORS.survivalMaritime);
  if (!values.survivalJungle) crossOut(page, INDICATORS.survivalJungle);

  const hasJackets =
    values.jacketLight || values.jacketFluorescent || values.jacketUhf || values.jacketVhf;
  if (!hasJackets) crossOut(page, INDICATORS.jackets);
  if (!values.jacketLight) crossOut(page, INDICATORS.jacketLight);
  if (!values.jacketFluorescent) crossOut(page, INDICATORS.jacketFluorescent);
  if (!values.jacketUhf) crossOut(page, INDICATORS.jacketUhf);
  if (!values.jacketVhf) crossOut(page, INDICATORS.jacketVhf);

  if (values.dinghiesHasDinghy) {
    drawComb(page, fonts.mono, values.dinghiesNumber.padStart(2, " "), COMBS.dinghiesNumber);
    drawComb(page, fonts.mono, values.dinghiesCapacity.padStart(3, " "), COMBS.dinghiesCapacity);
    if (!values.dinghiesCovered) crossOut(page, INDICATORS.dinghiesCover);
    drawBoxText(page, fonts.mono, values.dinghiesColor.toUpperCase(), BOXES.dinghiesColour, { size: 9.5 });
  } else {
    crossOut(page, INDICATORS.dinghies);
  }

  drawBoxText(page, fonts.sans, flightPlan.aircraftColorMarkings.toUpperCase(), BOXES.colourMarkings, { size: 10 });
  drawBoxText(page, fonts.sans, values.remarks, BOXES.remarks, { size: 9 });
  if (!values.remarks.trim()) crossOut(page, INDICATORS.remarksN);
  drawBoxText(page, fonts.sans, values.pilotInCommandName.toUpperCase(), BOXES.pilotInCommand, { size: 10 });

  // Signature block
  drawSignatureColumn(page, fonts, SIGNATURE_COLUMNS.pilot, flightPlan.filedByName, flightPlan.pilotSignatureSvg);
  drawSmallLine(page, fonts.sansBold, formatLicenseLine(flightPlan.pilotLicenses), SIGNATURE_COLUMNS.pilotLicense);
  drawSignatureColumn(page, fonts, SIGNATURE_COLUMNS.representative, flightPlan.representativeName, flightPlan.representativeSignatureSvg);
  drawSmallLine(page, fonts.sansBold, formatLicenseLine(flightPlan.representativeLicenses), SIGNATURE_COLUMNS.representativeLicense);

  // Anything not yet approved prints as a draft, like the sample scan.
  if (flightPlan.requestStatus !== "approved") {
    page.drawText("DRAFT", {
      x: 120,
      y: 420,
      size: 150,
      font: fonts.sansBold,
      color: rgb(0.3, 0.33, 0.57),
      opacity: 0.12,
      rotate: degrees(20),
    });
  }

  return doc;
}
