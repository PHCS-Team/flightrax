import { NextResponse } from "next/server";

import { getFlightPlanAircraft } from "@/modules/flight-documents/services/aircraft-options.server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const aircraft = await getFlightPlanAircraft(id);

    return NextResponse.json(aircraft);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load aircraft.";
    const status = message.includes("permission") ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}
