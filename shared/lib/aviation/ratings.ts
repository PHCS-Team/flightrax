import type {
  AircraftTypeRatingSource,
  RatingOption,
} from "@/shared/types/rating-option";

// Ratings that are not tied to an aircraft type. Aircraft ratings are
// derived from aircraft_types at read time, so adding a type in the
// manager makes it selectable here with no code change.
export const BASIC_RATING_OPTIONS = [
  { value: "instrument_rating", label: "Instrument Rating", abbreviation: "IR" },
] as const satisfies ReadonlyArray<RatingOption>;

// Stored rating value for an aircraft type: "type:<type_key>". The key is
// what licenses keep in their text[] — if a type is ever removed the value
// still resolves to a readable fallback below.
export const AIRCRAFT_RATING_PREFIX = "type:";

export function aircraftRatingValue(typeKey: string) {
  return `${AIRCRAFT_RATING_PREFIX}${typeKey}`;
}

export function buildRatingOptions(
  aircraftTypes: readonly AircraftTypeRatingSource[],
): RatingOption[] {
  return [
    ...BASIC_RATING_OPTIONS,
    ...aircraftTypes.map((type) => ({
      value: aircraftRatingValue(type.typeKey),
      label: `${type.type} Rating`,
      abbreviation: type.icaoDesignator,
    })),
  ];
}

function humanize(value: string) {
  return value
    .replace(AIRCRAFT_RATING_PREFIX, "")
    .replace(/_rating$/i, "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// Never throws: a value with no matching option (legacy key, deleted
// type) still gets a label and a short form built from the key itself.
export function resolveRating(
  value: string,
  options: readonly RatingOption[],
): RatingOption {
  const match = options.find((option) => option.value === value);

  if (match) {
    return match;
  }

  const readable = humanize(value);

  return {
    value,
    label: value.startsWith(AIRCRAFT_RATING_PREFIX) ? `${readable} Rating` : readable,
    abbreviation: readable.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 8),
  };
}

export function resolveRatings(
  values: readonly string[] | null | undefined,
  options: readonly RatingOption[],
): RatingOption[] {
  return (values ?? []).map((value) => resolveRating(value, options));
}
