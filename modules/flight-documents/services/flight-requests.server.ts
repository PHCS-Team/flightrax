import "server-only";

import { FLIGHT_REQUEST_STATUS_GROUPS } from "@/modules/flight-documents/constants/flight-request-options";
import type {
  FlightRequestListItem,
  FlightRequestReviewListItem,
  FlightRequestReviewScope,
  FlightRequestStatus,
  FlightRequestStatusGroup,
} from "@/modules/flight-documents/types/flight-request";
import { canReviewFlightRequests } from "@/modules/flight-documents/utils/can-review-flight-requests";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import { AIRCRAFT_PHOTOS_BUCKET } from "@/shared/lib/storage/buckets";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import type { PaginatedResponse } from "@/shared/types/pagination";

const FLIGHT_REQUEST_LIST_SELECT =
  "id, status, rejected_reason, flight_plan_id, weight_balance_id, created_at, updated_at, flight_plans!inner(plan_code, aircraft_identification, type_of_aircraft, departure_aerodrome, destination_aerodrome, dof_raw, dof_resolved, departure_time_raw, aircrafts(photo_path))";

export async function getOwnFlightRequestsPage(
  page: number,
  pageSize: number,
  group: FlightRequestStatusGroup,
  search: string,
): Promise<PaginatedResponse<FlightRequestListItem>> {
  const viewer = await getCurrentAuthorizationProfile();

  if (!viewer || !isApproved(viewer)) {
    throw new Error("You do not have permission to view flight plans.");
  }

  const supabase = createAdminClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const codeSearch = search.trim().replace(/[%_]/g, "\\$&");
  const statuses = [...FLIGHT_REQUEST_STATUS_GROUPS[group]];

  let countQuery = supabase
    .from("flight_requests")
    .select("flight_plans!inner(plan_code)", { count: "exact", head: true })
    .eq("requested_by", viewer.id)
    .in("status", statuses);

  if (codeSearch) {
    countQuery = countQuery.ilike("flight_plans.plan_code", `%${codeSearch}%`);
  }

  const { count, error: countError } = await countQuery;

  if (countError) {
    throw new Error(countError.message);
  }

  let listQuery = supabase
    .from("flight_requests")
    .select(FLIGHT_REQUEST_LIST_SELECT)
    .eq("requested_by", viewer.id)
    .in("status", statuses);

  if (codeSearch) {
    listQuery = listQuery.ilike("flight_plans.plan_code", `%${codeSearch}%`);
  }

  const { data, error } = await listQuery
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const totalCount = count ?? 0;
  const storage = supabase.storage.from(AIRCRAFT_PHOTOS_BUCKET);

  return {
    data: (data ?? []).map((row) => ({
      id: row.id,
      flightPlanId: row.flight_plan_id,
      status: row.status as FlightRequestStatus,
      rejectedReason: row.rejected_reason,
      planCode: row.flight_plans.plan_code,
      aircraftIdentification: row.flight_plans.aircraft_identification,
      typeOfAircraft: row.flight_plans.type_of_aircraft,
      aircraftPhotoUrl: row.flight_plans.aircrafts?.photo_path
        ? storage.getPublicUrl(row.flight_plans.aircrafts.photo_path).data
            .publicUrl
        : null,
      departureAerodrome: row.flight_plans.departure_aerodrome,
      destinationAerodrome: row.flight_plans.destination_aerodrome,
      dofRaw: row.flight_plans.dof_raw,
      dofResolved: row.flight_plans.dof_resolved,
      departureTimeRaw: row.flight_plans.departure_time_raw,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      hasWeightBalance: Boolean(row.weight_balance_id),
    })),
    totalCount,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
  };
}

const FLIGHT_REQUEST_REVIEW_SELECT =
  "id, status, rejected_reason, flight_plan_id, weight_balance_id, created_at, updated_at, profiles!flight_requests_requested_by_fkey(full_name), instructor:profiles!flight_requests_instructor_profile_id_fkey(full_name), flight_plans!inner(plan_code, aircraft_identification, type_of_aircraft, departure_aerodrome, destination_aerodrome, dof_raw, dof_resolved, departure_time_raw, pilot_in_command_id, pilot_in_command_name, aircrafts(photo_path))";

export async function getReviewFlightRequestsPage(
  page: number,
  pageSize: number,
  scope: FlightRequestReviewScope,
  search: string,
): Promise<PaginatedResponse<FlightRequestReviewListItem>> {
  const viewer = await getCurrentAuthorizationProfile();

  if (!viewer || !isApproved(viewer) || !canReviewFlightRequests(viewer)) {
    throw new Error("You do not have permission to review flight requests.");
  }

  const supabase = createAdminClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const codeSearch = search.trim().replace(/[%_]/g, "\\$&");

  let countQuery = supabase
    .from("flight_requests")
    .select("flight_plans!inner(plan_code, pilot_in_command_id)", {
      count: "exact",
      head: true,
    })
    .eq("status", "pending_approval");

  let listQuery = supabase
    .from("flight_requests")
    .select(FLIGHT_REQUEST_REVIEW_SELECT)
    .eq("status", "pending_approval");

  if (scope === "assigned") {
    const { data: picPlans, error: picPlansError } = await supabase
      .from("flight_plans")
      .select("id, flight_requests!inner(status)")
      .eq("pilot_in_command_id", viewer.id)
      .eq("flight_requests.status", "pending_approval");

    if (picPlansError) {
      throw new Error(picPlansError.message);
    }

    const picPlanIds = (picPlans ?? []).map((plan) => plan.id);
    const assignedFilter = [
      `instructor_profile_id.eq.${viewer.id}`,
      ...(picPlanIds.length > 0
        ? [`flight_plan_id.in.(${picPlanIds.join(",")})`]
        : []),
    ].join(",");

    countQuery = countQuery.or(assignedFilter);
    listQuery = listQuery.or(assignedFilter);
  }

  if (codeSearch) {
    countQuery = countQuery.ilike("flight_plans.plan_code", `%${codeSearch}%`);
    listQuery = listQuery.ilike("flight_plans.plan_code", `%${codeSearch}%`);
  }

  const { count, error: countError } = await countQuery;

  if (countError) {
    throw new Error(countError.message);
  }

  const { data, error } = await listQuery
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const totalCount = count ?? 0;
  const storage = supabase.storage.from(AIRCRAFT_PHOTOS_BUCKET);

  return {
    data: (data ?? []).map((row) => ({
      id: row.id,
      flightPlanId: row.flight_plan_id,
      status: row.status as FlightRequestStatus,
      rejectedReason: row.rejected_reason,
      planCode: row.flight_plans.plan_code,
      aircraftIdentification: row.flight_plans.aircraft_identification,
      typeOfAircraft: row.flight_plans.type_of_aircraft,
      aircraftPhotoUrl: row.flight_plans.aircrafts?.photo_path
        ? storage.getPublicUrl(row.flight_plans.aircrafts.photo_path).data
            .publicUrl
        : null,
      departureAerodrome: row.flight_plans.departure_aerodrome,
      destinationAerodrome: row.flight_plans.destination_aerodrome,
      dofRaw: row.flight_plans.dof_raw,
      dofResolved: row.flight_plans.dof_resolved,
      departureTimeRaw: row.flight_plans.departure_time_raw,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      requestedByName: row.profiles.full_name,
      pilotInCommandName: row.flight_plans.pilot_in_command_name ?? "",
      instructorName: row.instructor?.full_name ?? "",
      hasWeightBalance: Boolean(row.weight_balance_id),
    })),
    totalCount,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
  };
}
