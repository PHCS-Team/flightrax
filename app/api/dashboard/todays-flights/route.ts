import { NextResponse } from "next/server";

import { getTodaysFlightsPage } from "@/modules/dashboard/services/todays-flights.server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(
      20,
      Math.max(1, Number(searchParams.get("pageSize")) || 5),
    );
    const search = searchParams.get("search") ?? "";

    const result = await getTodaysFlightsPage(page, pageSize, search);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load today's flights.";
    const status = message.includes("permission") ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}
