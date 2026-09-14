import { NextResponse } from "next/server";

import { getScheduleUploadMonth } from "@/modules/schedule/services/schedule-uploads.server";
import { isMonthString } from "@/modules/schedule/utils/schedule-month";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") ?? "";

  if (!isMonthString(month)) {
    return NextResponse.json(
      { message: "Pick a valid month." },
      { status: 400 },
    );
  }

  try {
    const result = await getScheduleUploadMonth(month);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load the schedule files.";
    const status = message.includes("permission") ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}
