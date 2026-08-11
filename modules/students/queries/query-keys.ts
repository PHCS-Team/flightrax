import { STUDENTS_PARENT_QUERY_KEY } from "@/shared/lib/query-keys";

export const STUDENTS_QUERY_KEYS = {
  all: STUDENTS_PARENT_QUERY_KEY,
  approved: (page: number, pageSize: number, search: string) =>
    [...STUDENTS_PARENT_QUERY_KEY, "approved", { page, pageSize, search }] as const,
};
