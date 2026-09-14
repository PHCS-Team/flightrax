export const SCHEDULE_VIEWS = ["board", "files"] as const;

export type ScheduleView = (typeof SCHEDULE_VIEWS)[number];
