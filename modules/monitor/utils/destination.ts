// The DEST/ line of Other Information holds the readable destination:
// "RPLI - LAOAG INTERNATIONAL AIRPORT" for a listed aerodrome, or the
// home-field text "RPT-20 BINALONAN" for ZZZZ. Strip the leading code so
// the TV shows the place, falling back to the ICAO code when the line is
// missing.
export function formatDestination(
  destinationText: string | null,
  destinationAerodrome: string,
): string {
  const cleaned = (destinationText ?? "")
    .trim()
    .replace(/^[A-Z]{4}\s*-\s*/i, "")
    .replace(/^[A-Z]+-\d+\s+/i, "")
    .trim();

  if (!cleaned) {
    return destinationAerodrome.trim().toUpperCase() || "—";
  }

  return cleaned
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
