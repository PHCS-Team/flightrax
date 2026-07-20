import { NextResponse } from "next/server";

import { getAircraftTypes } from "@/modules/aircrafts/services/aircraft-types.server";

export async function GET() {
  try {
    const types = await getAircraftTypes();

    return NextResponse.json(types);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load aircraft types.";
    const status = message.includes("permission") ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}
