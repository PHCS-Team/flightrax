import { NextResponse } from "next/server";

import { getFlightLogsAuditPage } from "@/modules/flight-documents/services/flight-logs-audit.server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, Number(searchParams.get("pageSize")) || 10),
    );
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "all";

    const result = await getFlightLogsAuditPage(page, pageSize, search, status);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load flight logs.";
    const status = message.includes("permission") ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}
