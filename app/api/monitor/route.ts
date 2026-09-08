import { NextResponse } from "next/server";

import { getFlightMonitorBoard } from "@/modules/monitor/services/monitor.server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const board = await getFlightMonitorBoard();

    return NextResponse.json(board, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load the flight monitor.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
