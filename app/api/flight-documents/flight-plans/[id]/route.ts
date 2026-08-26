import { NextResponse } from "next/server";

import { getOwnFlightPlanForEdit } from "@/modules/flight-documents/services/flight-plans.server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const flightPlan = await getOwnFlightPlanForEdit(id);

    return NextResponse.json(flightPlan);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load flight plan.";
    const status = message.includes("permission") ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}
