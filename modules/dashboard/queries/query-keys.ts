export const DASHBOARD_QUERY_KEYS = {
  all: ["dashboard"] as const,
  flightStatusAll: ["dashboard", "flight-status"] as const,
  flightStatus: (page: number, pageSize: number) =>
    ["dashboard", "flight-status", { page, pageSize }] as const,
  todaysFlightsAll: ["dashboard", "todays-flights"] as const,
  todaysFlights: (page: number, pageSize: number, search: string) =>
    ["dashboard", "todays-flights", { page, pageSize, search }] as const,
};
