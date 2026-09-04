// Postgres unique_violation. The constraint name rides in the message, so
// the user hears which field collided instead of a raw database error.
const UNIQUE_VIOLATION = "23505";

const DUPLICATE_MESSAGES: Record<string, string> = {
  aircrafts_registration_mark_key:
    "An aircraft with this registration mark already exists.",
  aircrafts_registration_number_key:
    "An aircraft with this registration number already exists.",
  aircrafts_serial_number_key:
    "An aircraft with this serial number already exists.",
};

export function getAircraftWriteErrorMessage(error: {
  code?: string;
  message: string;
}): string {
  if (error.code !== UNIQUE_VIOLATION) {
    return error.message;
  }

  const hit = Object.entries(DUPLICATE_MESSAGES).find(([constraint]) =>
    error.message.includes(constraint),
  );

  return hit?.[1] ?? "An aircraft with these registration details already exists.";
}
