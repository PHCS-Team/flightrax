export const SCHEDULE_QUERY_KEYS = {
  all: ["schedule"] as const,
  days: ["schedule", "day"] as const,
  day: (date: string) => ["schedule", "day", { date }] as const,
  people: ["schedule", "people"] as const,
  uploads: ["schedule", "uploads"] as const,
  uploadMonth: (month: string) =>
    ["schedule", "uploads", "month", { month }] as const,
  upload: (id: string) => ["schedule", "uploads", "detail", { id }] as const,
};
