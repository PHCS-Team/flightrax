export const FLIGHT_DOCUMENTS_QUERY_KEYS = {
  all: ["flight-documents"] as const,
  aircraftOptionsAll: ["flight-documents", "aircraft-options"] as const,
  aircraftOptions: (pageSize: number, search: string, typeKey: string) =>
    [
      "flight-documents",
      "aircraft-options",
      { pageSize, search, typeKey },
    ] as const,
  aircraft: (aircraftId: string) =>
    ["flight-documents", "aircraft", aircraftId] as const,
  typeOptions: ["flight-documents", "type-options"] as const,
  filerContext: ["flight-documents", "filer-context"] as const,
  picOptions: ["flight-documents", "pic-options"] as const,
  requests: (pageSize: number, group: string, search: string) =>
    ["flight-documents", "requests", { pageSize, group, search }] as const,
  requestsAll: ["flight-documents", "requests"] as const,
  reviewRequestsAll: ["flight-documents", "review-requests"] as const,
  reviewRequests: (pageSize: number, scope: string, search: string) =>
    [
      "flight-documents",
      "review-requests",
      { pageSize, scope, search },
    ] as const,
  flightPlan: (flightPlanId: string) =>
    ["flight-documents", "flight-plan", flightPlanId] as const,
  weightBalance: (flightPlanId: string) =>
    ["flight-documents", "weight-balance", flightPlanId] as const,
  journey: (flightPlanId: string) =>
    ["flight-documents", "journey", flightPlanId] as const,
  auditLogsAll: ["flight-documents", "audit-logs"] as const,
  auditLogs: (pageSize: number, search: string, status: string) =>
    ["flight-documents", "audit-logs", { pageSize, search, status }] as const,
};
