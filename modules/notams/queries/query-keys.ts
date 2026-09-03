export const NOTAMS_QUERY_KEYS = {
  all: ["notams"] as const,
  list: (page: number, pageSize: number, search: string, severity: string, expiry: string) =>
    [...NOTAMS_QUERY_KEYS.all, "list", { page, pageSize, search, severity, expiry }] as const,
};