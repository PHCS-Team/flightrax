import type {
  Aircraft,
  AircraftEditSnapshot,
  AircraftVersionRow,
} from "@/modules/aircrafts/types/aircraft";

// Every write carries the updated_at the user loaded. If the row moved on
// since then, another admin saved or deleted it and the write is refused
// instead of silently overwriting their change.
export const AIRCRAFT_VERSION_SELECT =
  "id, registration_number, registration_mark, aircraft_type, color_markings, photo_path, remarks, serial_number, status, updated_at" as const;

export const AIRCRAFT_DELETED_WHILE_EDITING_MESSAGE =
  "This aircraft was deleted by another user while you were editing it. Your changes were not saved.";

export const AIRCRAFT_NO_LONGER_EXISTS_MESSAGE =
  "This aircraft was deleted by another user. The list has been refreshed.";

export function toAircraftEditSnapshot(
  row: AircraftVersionRow,
): AircraftEditSnapshot {
  return {
    aircraftType: row.aircraft_type,
    colorMarkings: row.color_markings,
    photoPath: row.photo_path,
    registrationMark: row.registration_mark,
    registrationNumber: row.registration_number,
    remarks: row.remarks ?? "",
    serialNumber: row.serial_number ?? "",
    status: row.status,
    updatedAt: row.updated_at,
  };
}

export function aircraftToEditSnapshot(
  aircraft: Aircraft,
): AircraftEditSnapshot {
  return {
    aircraftType: aircraft.aircraftType,
    colorMarkings: aircraft.colorMarkings,
    photoPath: aircraft.photoPath,
    registrationMark: aircraft.registrationMark,
    registrationNumber: aircraft.registrationNumber,
    remarks: aircraft.remarks ?? "",
    serialNumber: aircraft.serialNumber ?? "",
    status: aircraft.status,
    updatedAt: aircraft.updatedAt,
  };
}

const SNAPSHOT_FIELD_LABELS: [keyof AircraftEditSnapshot, string][] = [
  ["status", "Status"],
  ["aircraftType", "Aircraft Type"],
  ["registrationMark", "Registration Mark"],
  ["registrationNumber", "Registration No."],
  ["serialNumber", "Serial Number"],
  ["colorMarkings", "Color and Markings"],
  ["remarks", "Remarks"],
  ["photoPath", "Aircraft Image"],
];

export function getChangedAircraftFields(
  before: AircraftEditSnapshot,
  after: AircraftEditSnapshot,
): string[] {
  return SNAPSHOT_FIELD_LABELS.filter(
    ([field]) => (before[field] ?? "") !== (after[field] ?? ""),
  ).map(([, label]) => label);
}
