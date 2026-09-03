import "server-only";

import type { FlightLogEntry } from "@/shared/types/flight-log";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import { AIRCRAFT_PHOTOS_BUCKET } from "@/shared/lib/storage/buckets";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import type { PaginatedResponse } from "@/shared/types/pagination";

// The viewer's own flight history: journeys whose lifecycle ended —
// completed (arrived/standby) or cancelled — most recent change first.
export async function getAccountFlightLogsPage(
  page: number,
  pageSize: number,
): Promise<PaginatedResponse<FlightLogEntry>> {
  const viewer = await getCurrentAuthorizationProfile();

  if (!viewer || !isApproved(viewer)) {
    throw new Error("You do not have permission to view flight logs.");
  }

  const supabase = createAdminClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("flight_journeys")
    .select(
      "id, status, dof_date, commenced_at, terminated_at, cancelled_at, flight_requests!inner(requested_by, flight_plans!inner(id, aircraft_identification, departure_aerodrome, destination_aerodrome, aircrafts(photo_path)))",
      { count: "exact" },
    )
    .in("status", ["arrived", "standby", "cancelled"])
    .eq("flight_requests.requested_by", viewer.id)
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const storage = supabase.storage.from(AIRCRAFT_PHOTOS_BUCKET);
  const totalCount = count ?? 0;

  return {
    data: (data ?? []).map((row) => {
      const plan = row.flight_requests.flight_plans;

      return {
        journeyId: row.id,
        flightPlanId: plan.id,
        journeyStatus: row.status as FlightLogEntry["journeyStatus"],
        aircraftIdentification: plan.aircraft_identification,
        departureAerodrome: plan.departure_aerodrome ?? "",
        destinationAerodrome: plan.destination_aerodrome ?? "",
        dofDate: row.dof_date,
        commencedAt: row.commenced_at,
        terminatedAt: row.terminated_at,
        cancelledAt: row.cancelled_at,
        photoUrl: plan.aircrafts?.photo_path
          ? storage.getPublicUrl(plan.aircrafts.photo_path).data.publicUrl
          : null,
      };
    }),
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}
