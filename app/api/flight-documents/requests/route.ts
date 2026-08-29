import { NextResponse } from "next/server";

import { FLIGHT_REQUEST_STATUS_GROUPS } from "@/modules/flight-documents/constants/flight-request-options";
import { getOwnFlightRequestsPage } from "@/modules/flight-documents/services/flight-requests.server";
import type { FlightRequestStatusGroup } from "@/modules/flight-documents/types/flight-request";

const VALID_GROUPS = Object.keys(
  FLIGHT_REQUEST_STATUS_GROUPS,
) as FlightRequestStatusGroup[];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, Number(searchParams.get("pageSize")) || 10),
    );
    const groupParam = searchParams.get("group") ?? "in_progress";
    const group = VALID_GROUPS.includes(groupParam as FlightRequestStatusGroup)
      ? (groupParam as FlightRequestStatusGroup)
      : "in_progress";
    const search = searchParams.get("search") ?? "";

    const result = await getOwnFlightRequestsPage(page, pageSize, group, search);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load flight plans.";
    const status = message.includes("permission") ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}
