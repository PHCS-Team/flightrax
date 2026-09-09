// TODO(notifications): two events are still owed — a schedule event once
// modules/schedule exists, and license/certificate expiry warnings once a
// cron is written for them. Both are tracked in
// docs/NOTIFICATIONS-MATRIX.md §5.
//
// Adding an event touches five places, in this order:
//   1. a migration extending the `type` check constraint on
//      public.notifications — the constraint is the source of truth
//   2. NOTIFICATION_TYPES below
//   3. PRESENTATION in ../utils/notification-presentation.ts (icon + tone);
//      an unmapped type still renders, it just falls back to the bell
//   4. a trigger calling public.create_notifications(), which applies
//      Rule A (never the actor) and Rule D (one row per person)
//   5. the matrix and the checklist in docs/NOTIFICATIONS-TEST-PLAN.md
//
// Check the href points somewhere the recipient can actually open: route
// guards live in shared/lib/rbac/routes.ts. Sending people to a page their
// role cannot reach has been the most common mistake here.

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
