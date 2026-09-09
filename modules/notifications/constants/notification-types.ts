export const NOTIFICATION_TYPES = [
  "account_approved",
  "account_rejected",
  "account_submitted",
  "account_resubmitted",
  "admin_registered",
  "flight_request_submitted",
  "flight_request_approved",
  "flight_request_rejected",
  "flight_request_withdrawn",
  "flight_commenced",
  "flight_arrived",
  "flight_cancelled",
  "flight_no_show",
  "notam_posted",
  "aircraft_status_changed",
  "instructor_unavailable",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

const KNOWN_TYPES = new Set<string>(NOTIFICATION_TYPES);

export function isNotificationType(value: string): value is NotificationType {
  return KNOWN_TYPES.has(value);
}
