import { NextResponse } from "next/server";

import { getFlightPlanTypeOptions } from "@/modules/flight-documents/services/aircraft-options.server";

export async function GET() {
  try {
    const options = await getFlightPlanTypeOptions();

    return NextResponse.json(options);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load aircraft types.";
    const status = message.includes("permission") ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}
