import { NextResponse } from "next/server";

import { getFlightPlanPicOptions } from "@/modules/flight-documents/services/flight-plan-filer.server";

export async function GET() {
  try {
    const options = await getFlightPlanPicOptions();

    return NextResponse.json(options);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load instructors.";
    const status = message.includes("permission") ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}
