import { NextResponse } from "next/server";

import { getFlightJourneyDetails } from "@/modules/flight-documents/services/flight-journey.server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const journey = await getFlightJourneyDetails(id);

    return NextResponse.json(journey);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load the flight journey.";
    const status = message.includes("permission") ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}
