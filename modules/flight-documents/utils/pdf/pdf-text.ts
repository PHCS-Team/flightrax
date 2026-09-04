import type { PDFFont } from "pdf-lib";

// The standard PDF fonts (Helvetica/Courier) only encode WinAnsi. Anything
// outside it would throw at draw time, so map the few characters the app
// produces and drop the rest.
const REPLACEMENTS: Record<string, string> = {
  "→": "->",
  "←": "<-",
  "≡": "=",
  "–": "-",
  "—": "-",
  "‘": "'",
  "’": "'",
  "“": '"',
  "”": '"',
  "…": "...",
  "·": "-",
  "✓": "X",
};

export function pdfSafe(text: string): string {
  return Array.from(text)
    .map((char) => {
      if (char in REPLACEMENTS) {
        return REPLACEMENTS[char];
      }

      const code = char.charCodeAt(0);

      return code < 256 ? char : "?";
    })
    .join("");
}

// Largest size (down to `min`) at which `text` fits `width`.
export function fitFontSize(
  font: PDFFont,
  text: string,
  width: number,
  preferred: number,
  min = 5,
): number {
  let size = preferred;

  while (size > min && font.widthOfTextAtSize(text, size) > width) {
    size -= 0.5;
  }

  return size;
}

// Greedy word wrap for a fixed font size.
export function wrapText(
  font: PDFFont,
  text: string,
  width: number,
  size: number,
): string[] {
  const lines: string[] = [];

  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let current = "";

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;

      if (font.widthOfTextAtSize(candidate, size) <= width || !current) {
        current = candidate;
      } else {
        lines.push(current);
        current = word;
      }
    }

    lines.push(current);
  }

  return lines;
}

const NUMBER_FORMAT = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

export function formatSheetNumber(value: number | null): string {
  return value !== null && Number.isFinite(value)
    ? NUMBER_FORMAT.format(value)
    : "";
}

// Greedy word-fill across rows that may differ in width (Item 18's first
// row starts further right than the rest). Returns one string per row;
// `overflow` is true when words remain after the last row.
export function wrapToRows(
  font: PDFFont,
  text: string,
  rowWidths: readonly number[],
  size: number,
): { rows: string[]; overflow: boolean } {
  const words = text.split(/\s+/).filter(Boolean);
  const rows: string[] = [];
  let index = 0;

  for (const width of rowWidths) {
    let current = "";

    while (index < words.length) {
      const candidate = current ? `${current} ${words[index]}` : words[index];

      if (font.widthOfTextAtSize(candidate, size) <= width || !current) {
        current = candidate;
        index += 1;
      } else {
        break;
      }
    }

    rows.push(current);
  }

  // Anything left rides on the last row; the caller shrinks or squeezes it.
  if (index < words.length) {
    rows[rows.length - 1] = [rows[rows.length - 1], ...words.slice(index)]
      .filter(Boolean)
      .join(" ");
  }

  return { rows, overflow: index < words.length };
}
