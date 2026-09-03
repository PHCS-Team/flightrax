import "server-only";

import type { TodaysFlightRow } from "@/modules/dashboard/types/todays-flight";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { ROLE } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import type { PaginatedResponse } from "@/shared/types/pagination";

export async function getTodaysFlightsPage(
  page: number,
  pageSize: number,
  search: string,
): Promise<PaginatedResponse<TodaysFlightRow>> {
  const viewer = await getCurrentAuthorizationProfile();

  if (!viewer || !isApproved(viewer)) {
    throw new Error("You do not have permission to view today's flights.");
  }

  // Instructors and superadmins see every flight; everyone else only
  // the requests they filed.
  const seesAll =
    viewer.role === ROLE.INSTRUCTOR || viewer.role === ROLE.SUPERADMIN;

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("get_todays_flights", {
    p_page: page,
    p_page_size: pageSize,
    ...(search.trim() ? { p_search: search.trim() } : {}),
    ...(seesAll ? {} : { p_requested_by: viewer.id }),
  });

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  const totalCount = rows[0]?.total_count ?? 0;

  return {
    data: rows.map((row) => ({
      journeyId: row.journey_id,
      journeyStatus: row.journey_status,
      flightRequestId: row.flight_request_id,
      flightPlanId: row.flight_plan_id,
      requestedById: row.requested_by,
      aircraftIdentification: row.aircraft_identification,
      departureAerodrome: row.departure_aerodrome ?? "",
      destinationAerodrome: row.destination_aerodrome ?? "",
      departureTimeRaw: row.departure_time_raw ?? "",
      dofAt: row.dof_at,
      commencedAt: row.commenced_at,
      traineeName: row.trainee_name ?? "",
      pilotInCommandName: row.pilot_in_command_name ?? "",
    })),
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}
