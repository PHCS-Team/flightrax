import "server-only";

import type { DashboardFlightStatusRow } from "@/modules/dashboard/types/flight-status";
import { deriveBoardStatus } from "@/modules/dashboard/utils/board-status";
import { formatIntervalHm } from "@/modules/dashboard/utils/format";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import { AIRCRAFT_PHOTOS_BUCKET } from "@/shared/lib/storage/buckets";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import type { PaginatedResponse } from "@/shared/types/pagination";

const STATUS_GROUPS = ["active", "arrived", "on_ground"] as const;

export async function getDashboardFlightStatusPage(
  page: number,
  pageSize: number,
  group: string,
): Promise<PaginatedResponse<DashboardFlightStatusRow>> {
  const viewer = await getCurrentAuthorizationProfile();

  if (!viewer || !isApproved(viewer)) {
    throw new Error("You do not have permission to view flight status.");
  }

  const statusGroup = STATUS_GROUPS.find((candidate) => candidate === group);

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("get_dashboard_flight_status", {
    p_page: page,
    p_page_size: pageSize,
    ...(statusGroup ? { p_status_group: statusGroup } : {}),
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
      registrationNumber: row.registration_number,
      registrationMark: row.registration_mark,
      typeName: row.type_name,
      typeIcaoDesignator: row.type_icao_designator,
      photoUrl: row.photo_path
        ? storage.getPublicUrl(row.photo_path).data.publicUrl
        : null,
      boardStatus: deriveBoardStatus(row.journey_status),
      journey: {
        id: row.journey_id,
        flightPlanId: row.flight_plan_id,
        status: row.journey_status,
        dofAt: row.dof_at,
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
        instructorName: row.instructor_name ?? "",
      },
    })),
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}
