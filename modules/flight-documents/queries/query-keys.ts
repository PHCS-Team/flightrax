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
  requests: (page: number, pageSize: number, status: string) =>
    ["flight-documents", "requests", { page, pageSize, status }] as const,
};
