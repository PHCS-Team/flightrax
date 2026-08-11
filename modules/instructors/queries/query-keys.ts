export const INSTRUCTORS_QUERY_KEYS = {
  all: ["instructors"] as const,
  approved: (page: number, pageSize: number, search: string) =>
    ["instructors", "approved", { page, pageSize, search }] as const,
};
