// TODO(notifications): the schedule module owes a notification event.
//
// It was left out of Phase 1 for a concrete reason, not an oversight: this
// module is still scaffolding, so there is no table and no action for a
// trigger to hang off. docs/NOTIFICATIONS-MATRIX.md §5 tracks it as
// deferred.
//
// When the schedule is built, decide the audience first (who is affected by
// a schedule change — the assigned student and instructor, or every
// student?), record it in the matrix, then follow the checklist in
// modules/notifications/constants/notification-types.ts.

export const SCHEDULE_VIEW = "schedule.view" as const;
export const SCHEDULE_MANAGE = "schedule.manage" as const;
