import { NextResponse } from "next/server";

import { getFlightPlanAircraftOptionsPage } from "@/modules/flight-documents/services/aircraft-options.server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, Number(searchParams.get("pageSize")) || 20),
    );
    const search = searchParams.get("search") ?? "";
    const typeKey = searchParams.get("type") ?? undefined;

    const result = await getFlightPlanAircraftOptionsPage(
      page,
      pageSize,
      search,
      typeKey,
    );

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load aircraft.";
    const status = message.includes("permission") ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}
