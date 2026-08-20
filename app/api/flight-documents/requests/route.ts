import { NextResponse } from "next/server";

import { getOwnFlightRequestsPage } from "@/modules/flight-documents/services/flight-requests.server";
import type { FlightRequestStatus } from "@/modules/flight-documents/types/flight-request";

const VALID_STATUSES: FlightRequestStatus[] = [
  "draft",
  "pending_approval",
  "approved",
  "rejected",
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, Number(searchParams.get("pageSize")) || 10),
    );
    const statusParam = searchParams.get("status") ?? "draft";
    const status = VALID_STATUSES.includes(statusParam as FlightRequestStatus)
      ? (statusParam as FlightRequestStatus)
      : "draft";

    const result = await getOwnFlightRequestsPage(page, pageSize, status);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load flight plans.";
    const status = message.includes("permission") ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}
