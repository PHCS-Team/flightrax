import { NextResponse } from "next/server";

import { getSchedulePeople } from "@/modules/schedule/services/schedule.server";

export async function GET() {
  try {
    const result = await getSchedulePeople();

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load people.";
    const status = message.includes("permission") ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}
