export const SCHEDULE_QUERY_KEYS = {
  all: ["schedule"] as const,
  days: ["schedule", "day"] as const,
  day: (date: string) => ["schedule", "day", { date }] as const,
  people: ["schedule", "people"] as const,
};
