import { ADMINS_PARENT_QUERY_KEY } from "@/shared/lib/query-keys";

export const ADMINS_QUERY_KEYS = {
  all: ADMINS_PARENT_QUERY_KEY,
  list: (page: number, pageSize: number, search: string) =>
    [...ADMINS_PARENT_QUERY_KEY, "list", { page, pageSize, search }] as const,
};
