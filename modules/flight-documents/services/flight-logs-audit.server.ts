import "server-only";

import { FLIGHT_PLANS_VIEW } from "@/modules/flight-documents/constants/permissions";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";
import { AIRCRAFT_PHOTOS_BUCKET } from "@/shared/lib/storage/buckets";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import type { FlightLogEntry } from "@/shared/types/flight-log";
import type { PaginatedResponse } from "@/shared/types/pagination";

type LoggedJourneyStatus = "arrived" | "standby" | "cancelled";

const STATUSES_BY_FILTER: Record<string, LoggedJourneyStatus[]> = {
  completed: ["arrived", "standby"],
  cancelled: ["cancelled"],
};

export async function getFlightLogsAuditPage(
  page: number,
  pageSize: number,
  search: string,
  status: string,
): Promise<PaginatedResponse<FlightLogEntry>> {
  const viewer = await getCurrentAuthorizationProfile();

  if (
    !viewer ||
    !isApproved(viewer) ||
    !hasPermission(viewer.role, FLIGHT_PLANS_VIEW, viewer.admin_department)
  ) {
    throw new Error(
      "You do not have permission to view the flight plans audit.",
    );
  }

  const supabase = createAdminClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const statuses: LoggedJourneyStatus[] = STATUSES_BY_FILTER[status] ?? [
    "arrived",
    "standby",
    "cancelled",
  ];

  let query = supabase
    .from("flight_journeys")
    .select(
      "id, status, dof_date, commenced_at, terminated_at, cancelled_at, flight_requests!inner(flight_plans!inner(id, aircraft_identification, departure_aerodrome, destination_aerodrome, pilot_name, pilot_in_command_name, aircrafts(photo_path)))",
      { count: "exact" },
    )
    .in("status", statuses);

  const term = search.trim();

  if (term) {
    query = query.or(
      `aircraft_identification.ilike.%${term}%,pilot_name.ilike.%${term}%,pilot_in_command_name.ilike.%${term}%`,
      { referencedTable: "flight_requests.flight_plans" },
    );
  }

  const { data, error, count } = await query
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
