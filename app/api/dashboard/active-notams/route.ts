import { NextResponse } from "next/server";

import { getActiveNotams } from "@/modules/dashboard/services/active-notams.server";

export async function GET() {
  try {
    const notams = await getActiveNotams();

    return NextResponse.json(notams);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load NOTAMs.";
    const status = message.includes("permission") ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}
