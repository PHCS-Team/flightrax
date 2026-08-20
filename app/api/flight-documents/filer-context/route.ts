import { NextResponse } from "next/server";

import { getFlightPlanFilerContext } from "@/modules/flight-documents/services/flight-plan-filer.server";

export async function GET() {
  try {
    const context = await getFlightPlanFilerContext();

    return NextResponse.json(context);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load your profile.";
    const status = message.includes("permission") ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}
