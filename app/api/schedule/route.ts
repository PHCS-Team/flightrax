import { NextResponse } from "next/server";

import { getScheduleDay } from "@/modules/schedule/services/schedule.server";
import { isDateString } from "@/modules/schedule/utils/schedule-time";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? "";

  if (!isDateString(date)) {
    return NextResponse.json(
      { message: "Pick a valid date." },
      { status: 400 },
    );
  }

  try {
    const result = await getScheduleDay(date);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load the schedule.";
    const status = message.includes("permission") ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}
