export const SCHEDULE_QUERY_KEYS = {
  all: ["schedule"] as const,
  overview: (monthKey: string) =>
    ["schedule", "overview", { month: monthKey }] as const,
  list: (
    monthKey: string,
    date: string | null,
    page: number,
    pageSize: number,
  ) =>
    ["schedule", "list", { month: monthKey, date, page, pageSize }] as const,
};