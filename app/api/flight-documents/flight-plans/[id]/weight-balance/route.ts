import { NextResponse } from "next/server";

import { getWeightBalanceContext } from "@/modules/flight-documents/services/weight-balance.server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const context = await getWeightBalanceContext(id);

    return NextResponse.json(context);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load weight and balance.";
    const status = message.includes("permission") ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}
