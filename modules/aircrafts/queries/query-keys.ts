export const AIRCRAFTS_QUERY_KEYS = {
  all: ["aircrafts"] as const,
  list: (page: number, pageSize: number, search: string, typeFilter?: string) =>
    ["aircrafts", "list", { page, pageSize, search, typeFilter }] as const,
  types: ["aircrafts", "types"] as const,
  weightBalance: (aircraftId: string) =>
    ["aircrafts", "weight-balance", aircraftId] as const,
};
