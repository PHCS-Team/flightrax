import { NextResponse } from "next/server";

import { getAircraftWeightBalance } from "@/modules/aircrafts/services/aircraft-weight-balance.server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const config = await getAircraftWeightBalance(id);

    return NextResponse.json(config);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load weight and balance.";
    const status = message.includes("permission") ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}
