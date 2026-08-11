import { NextResponse } from "next/server";

import { getAccountReviewMetrics } from "@/modules/account-review/services/account-review.server";

export async function GET() {
  try {
    const metrics = await getAccountReviewMetrics();

    return NextResponse.json(metrics);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load account review metrics.";
    const status = message.includes("permission") ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}
