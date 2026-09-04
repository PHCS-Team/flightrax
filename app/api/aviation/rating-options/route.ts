import { NextResponse } from "next/server";

import { getRatingOptions } from "@/shared/lib/aviation/rating-options.server";

export async function GET() {
  try {
    return NextResponse.json(await getRatingOptions());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load ratings.";
    const status = message.includes("permission") ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}
