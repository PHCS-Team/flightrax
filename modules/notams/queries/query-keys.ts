import type {
  NotamSeverityFilter,
  NotamStatusFilter,
} from "@/modules/notams/types/notam";

export const NOTAMS_QUERY_KEYS = {
  all: ["notams"] as const,
  list: (
    pageSize: number,
    search: string,
    status: NotamStatusFilter,
    severity: NotamSeverityFilter,
  ) =>
    [
      ...NOTAMS_QUERY_KEYS.all,
      "list",
      { pageSize, search, status, severity },
    ] as const,
};
