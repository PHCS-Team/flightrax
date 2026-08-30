import "server-only";

import type { DashboardFlightStatusRow } from "@/modules/dashboard/types/flight-status";
import { deriveBoardStatus } from "@/modules/dashboard/utils/board-status";
import { formatIntervalHm } from "@/modules/dashboard/utils/format";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import { AIRCRAFT_PHOTOS_BUCKET } from "@/shared/lib/storage/buckets";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import type { PaginatedResponse } from "@/shared/types/pagination";

export async function getDashboardFlightStatusPage(
  page: number,
  pageSize: number,
): Promise<PaginatedResponse<DashboardFlightStatusRow>> {
  const viewer = await getCurrentAuthorizationProfile();

  if (!viewer || !isApproved(viewer)) {
    throw new Error("You do not have permission to view flight status.");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("get_dashboard_flight_status", {
    p_include_on_ground: true,
    p_page: page,
    p_page_size: pageSize,
  });

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  const storage = supabase.storage.from(AIRCRAFT_PHOTOS_BUCKET);
  const totalCount = rows[0]?.total_count ?? 0;

  return {
    data: rows.map((row) => ({
      aircraftId: row.id,
      aircraftIdentification: row.aircraft_identification,
      model: row.model,
      typeName: row.type_name,
      photoUrl: row.photo_path
        ? storage.getPublicUrl(row.photo_path).data.publicUrl
        : null,
      aircraftStatus: row.aircraft_status,
      boardStatus: deriveBoardStatus(row.aircraft_status, row.journey_status),
      journey:
        row.journey_id && row.journey_status
          ? {
              status: row.journey_status,
              commencedAt: row.commenced_at,
              terminatedAt: row.terminated_at,
              departureAerodrome: row.departure_aerodrome ?? "",
              destinationAerodrome: row.destination_aerodrome ?? "",
              departureTimeRaw: row.departure_time_raw ?? "",
              cruisingSpeed: row.cruising_speed ?? "",
              cruisingLevel: row.cruising_level ?? "",
              totalEet: row.total_eet ? formatIntervalHm(row.total_eet) : "",
              traineeName: row.trainee_name ?? "",
              pilotInCommandName: row.pilot_in_command_name ?? "",
            }
          : null,
    })),
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}
