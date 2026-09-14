import "server-only";

import { Workbook } from "exceljs";
import type {
  Cell,
  CellValue,
  Color,
  Fill,
  Worksheet,
} from "exceljs";

import {
  SCHEDULE_SHEET_MAX_COLS,
  SCHEDULE_SHEET_MAX_ROWS,
} from "@/modules/schedule/constants/schedule-upload";
import type {
  ParsedScheduleSheet,
  ScheduleSheetAlign,
  ScheduleSheetCell,
  ScheduleSheetGrid,
  ScheduleSheetMerge,
} from "@/modules/schedule/types/schedule-upload";
import { guessSheetDate } from "@/modules/schedule/utils/schedule-sheet-date";

// Reads an .xlsx workbook into the plain grid the viewer renders. Only what
// the paper board carries survives: text, fills, bold/italic, alignment,
// merges, and column/row sizes. Formulas are replaced by their cached
// result, dates and times by the text Excel would show.

// Office's default theme palette, by theme index. exceljs hands back the
// index and leaves the lookup to us.
const THEME_COLORS = [
  "FFFFFF",
  "000000",
  "E7E6E6",
  "44546A",
  "4472C4",
  "ED7D31",
  "A5A5A5",
  "FFC000",
  "5B9BD5",
  "70AD47",
  "0563C1",
  "954F72",
];

// The legacy 64-entry indexed palette (BIFF8), still emitted by some
// exporters and by files that started life as .xls.
const INDEXED_COLORS = [
  "000000", "FFFFFF", "FF0000", "00FF00", "0000FF", "FFFF00", "FF00FF", "00FFFF",
  "000000", "FFFFFF", "FF0000", "00FF00", "0000FF", "FFFF00", "FF00FF", "00FFFF",
  "800000", "008000", "000080", "808000", "800080", "008080", "C0C0C0", "808080",
  "9999FF", "993366", "FFFFCC", "CCFFFF", "660066", "FF8080", "0066CC", "CCCCFF",
  "000080", "FF00FF", "FFFF00", "00FFFF", "800080", "800000", "008080", "0000FF",
  "00CCFF", "CCFFFF", "CCFFCC", "FFFF99", "99CCFF", "FF99CC", "CC99FF", "FFCC99",
  "3366FF", "33CCCC", "99CC00", "FFCC00", "FF9900", "FF6600", "666699", "969696",
  "003366", "339966", "003300", "333300", "993300", "993366", "333399", "333333",
];

// Excel column width is in "characters"; ~7px each plus cell padding.
const COLUMN_CHAR_PX = 7;
const COLUMN_PADDING_PX = 5;
const DEFAULT_COLUMN_WIDTH_CHARS = 8.43;
// Row height is in points.
const POINT_PX = 4 / 3;
const DEFAULT_ROW_HEIGHT_POINTS = 15;
const MIN_ROW_HEIGHT_PX = 18;

type LooseColor = Partial<Color> & { indexed?: number; tint?: number };

function applyTint(hex: string, tint: number): string {
  return [0, 2, 4]
    .map((offset) => parseInt(hex.slice(offset, offset + 2), 16))
    .map((channel) =>
      tint < 0
        ? Math.round(channel * (1 + tint))
        : Math.round(channel + (255 - channel) * tint),
    )
    .map((channel) =>
      Math.max(0, Math.min(255, channel)).toString(16).padStart(2, "0"),
    )
    .join("")
    .toUpperCase();
}

function resolveColor(color: Partial<Color> | undefined): string | undefined {
  if (!color) {
    return undefined;
  }

  const loose = color as LooseColor;
  let hex: string | undefined;

  if (typeof loose.argb === "string" && loose.argb.length >= 6) {
    hex = loose.argb.slice(-6);
  } else if (typeof loose.theme === "number") {
    hex = THEME_COLORS[loose.theme];
  } else if (typeof loose.indexed === "number") {
    hex = INDEXED_COLORS[loose.indexed];
  }

  if (!hex || !/^[0-9A-Fa-f]{6}$/.test(hex)) {
    return undefined;
  }

  hex = hex.toUpperCase();

  if (typeof loose.tint === "number" && loose.tint !== 0) {
    hex = applyTint(hex, loose.tint);
  }

  return `#${hex}`;
}

function resolveFill(fill: Fill | undefined): string | undefined {
  if (!fill) {
    return undefined;
  }

  if (fill.type === "pattern") {
    if (!fill.pattern || fill.pattern === "none") {
      return undefined;
    }

    return resolveColor(fill.fgColor);
  }

  return resolveColor(fill.stops?.[0]?.color);
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// exceljs builds Dates from the serial in UTC, so read them back in UTC.
function formatDateValue(value: Date, numFmt: string | undefined): string {
  const format = (numFmt ?? "").toLowerCase();
  const hasTime = /h|s/.test(format);
  const hasDate = /y|d/.test(format) || (!hasTime && /m/.test(format));
  const hours = value.getUTCHours();
  const minutes = value.getUTCMinutes();
  const clock = `${pad(hours)}:${pad(minutes)}`;
  const day = value.getUTCDate();
  const year = value.getUTCFullYear();

  if (hasTime && !hasDate) {
    if (/am\/pm|a\/p/.test(format)) {
      const hour12 = hours % 12 === 0 ? 12 : hours % 12;

      return `${hour12}:${pad(minutes)} ${hours < 12 ? "AM" : "PM"}`;
    }

    return clock;
  }

  const date = format.includes("mmm")
    ? `${MONTH_NAMES[value.getUTCMonth()]} ${day}${/y/.test(format) ? `, ${year}` : ""}`
    : `${year}-${pad(value.getUTCMonth() + 1)}-${pad(day)}`;

  return hasTime ? `${date} ${clock}` : date;
}

function formatNumberValue(value: number, numFmt: string | undefined): string {
  if (!Number.isFinite(value)) {
    return "";
  }

  const format = numFmt ?? "";

  if (format.includes("%")) {
    return `${Math.round(value * 100)}%`;
  }

  // "0000" style formats keep leading zeros: 600 -> 0600.
  const zeros = /^0+$/.exec(format)?.[0].length;

  if (zeros && Number.isInteger(value)) {
    return String(value).padStart(zeros, "0");
  }

  if (Number.isInteger(value)) {
    return String(value);
  }

  return String(Math.round(value * 100) / 100);
}

function valueText(value: CellValue, numFmt: string | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return formatNumberValue(value, numFmt);
  }

  if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE";
  }

  if (value instanceof Date) {
    return formatDateValue(value, numFmt);
  }

  if ("richText" in value) {
    return value.richText.map((run) => run.text).join("");
  }

  if ("formula" in value || "sharedFormula" in value) {
    return valueText(value.result ?? null, numFmt);
  }

  if ("hyperlink" in value) {
    return typeof value.text === "string" ? value.text : "";
  }

  if ("error" in value) {
    return value.error;
  }

  return "";
}

function resolveAlign(cell: Cell): ScheduleSheetAlign | undefined {
  switch (cell.alignment?.horizontal) {
    case "center":
    case "centerContinuous":
    case "distributed":
      return "center";
    case "right":
      return "right";
    case "left":
      return "left";
    default:
      return undefined;
  }
}

function toCell(cell: Cell, r: number, c: number): ScheduleSheetCell | null {
  const text = valueText(cell.value, cell.numFmt).replace(/\r\n?/g, "\n");
  const fill = resolveFill(cell.fill);

  if (!text.trim() && !fill) {
    return null;
  }

  const result: ScheduleSheetCell = { r, c, v: text.trim() ? text : "" };
  const color = resolveColor(cell.font?.color);
  const align = resolveAlign(cell);

  if (fill) result.fill = fill;
  if (color && color !== "#000000") result.color = color;
  if (cell.font?.bold) result.bold = true;
  if (cell.font?.italic) result.italic = true;
  if (align) result.align = align;
  if (cell.alignment?.wrapText) result.wrap = true;

  return result;
}

function parseMergeRange(range: string): ScheduleSheetMerge | null {
  const match = /^([A-Z]+)(\d+):([A-Z]+)(\d+)$/.exec(range.toUpperCase());

  if (!match) {
    return null;
  }

  const column = (letters: string) =>
    letters
      .split("")
      .reduce((total, letter) => total * 26 + (letter.charCodeAt(0) - 64), 0);
  const top = Number(match[2]);
  const left = column(match[1]);
  const bottom = Number(match[4]);
  const right = column(match[3]);

  return {
    r: top,
    c: left,
    rowSpan: bottom - top + 1,
    colSpan: right - left + 1,
  };
}

function parseSheet(worksheet: Worksheet): ScheduleSheetGrid | null {
  const cells: ScheduleSheetCell[] = [];
  let rowCount = 0;
  let colCount = 0;

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > SCHEDULE_SHEET_MAX_ROWS) {
      return;
    }

    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      if (colNumber > SCHEDULE_SHEET_MAX_COLS) {
        return;
      }

      // A merged range reports the master's value on every cell it covers;
      // only the master is kept, the merge list tells the viewer its span.
      if (cell.isMerged && cell.master.address !== cell.address) {
        return;
      }

      const parsed = toCell(cell, rowNumber, colNumber);

      if (parsed) {
        cells.push(parsed);
        rowCount = Math.max(rowCount, rowNumber);
        colCount = Math.max(colCount, colNumber);
      }
    });
  });

  if (cells.length === 0 || !cells.some((cell) => cell.v.trim())) {
    return null;
  }

  const merges = worksheet.model.merges
    .map(parseMergeRange)
    .filter((merge): merge is ScheduleSheetMerge => merge !== null)
    .filter((merge) => merge.r <= rowCount && merge.c <= colCount)
    .map((merge) => ({
      ...merge,
      rowSpan: Math.min(merge.rowSpan, rowCount - merge.r + 1),
      colSpan: Math.min(merge.colSpan, colCount - merge.c + 1),
    }));

  const colWidths = Array.from({ length: colCount }, (_, index) => {
    const column = worksheet.getColumn(index + 1);

    if (column.hidden) {
      return 0;
    }

    const chars = column.width ?? DEFAULT_COLUMN_WIDTH_CHARS;

    return Math.round(chars * COLUMN_CHAR_PX + COLUMN_PADDING_PX);
  });

  const rowHeights = Array.from({ length: rowCount }, (_, index) => {
    const row = worksheet.getRow(index + 1);

    if (row.hidden) {
      return 0;
    }

    const points = row.height || DEFAULT_ROW_HEIGHT_POINTS;

    return Math.max(MIN_ROW_HEIGHT_PX, Math.round(points * POINT_PX));
  });

  return { rowCount, colCount, colWidths, rowHeights, merges, cells };
}

export async function parseScheduleWorkbook(
  bytes: ArrayBuffer,
  range: { startsOn: string; endsOn: string },
): Promise<ParsedScheduleSheet[]> {
  const workbook = new Workbook();

  await workbook.xlsx.load(bytes);

  const sheets: ParsedScheduleSheet[] = [];

  for (const worksheet of workbook.worksheets) {
    if (worksheet.state !== "visible") {
      continue;
    }

    const grid = parseSheet(worksheet);

    if (!grid) {
      continue;
    }

    sheets.push({
      position: sheets.length,
      name: worksheet.name.trim() || `Sheet ${sheets.length + 1}`,
      boardDate: guessSheetDate(worksheet.name, range),
      grid,
    });
  }

  return sheets;
}
