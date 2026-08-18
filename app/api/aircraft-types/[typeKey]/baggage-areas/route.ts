import { NextResponse } from "next/server";

import { getAircraftTypeBaggageAreas } from "@/modules/aircrafts/services/aircraft-types.server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ typeKey: string }> },
) {
  try {
    const { typeKey } = await params;
    const baggageAreas = await getAircraftTypeBaggageAreas(typeKey);

    return NextResponse.json(baggageAreas);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load baggage areas.";
    const status = message.includes("permission") ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}
