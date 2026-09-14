import { NextResponse } from "next/server";
import { z } from "zod";

import { getScheduleUpload } from "@/modules/schedule/services/schedule-uploads.server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json(
      { message: "This schedule file no longer exists." },
      { status: 404 },
    );
  }

  try {
    const result = await getScheduleUpload(id);

    if (!result) {
      return NextResponse.json(
        { message: "This schedule file no longer exists." },
        { status: 404 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load the schedule file.";
    const status = message.includes("permission") ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}
