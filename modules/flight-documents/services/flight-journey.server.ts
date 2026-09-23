import "server-only";

import type {
  FlightJourneyDetails,
  JourneyStatus,
} from "@/modules/flight-documents/types/flight-request";
import { canViewFlightDocumentRecords } from "@/modules/flight-documents/utils/can-review-flight-requests";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { describeActionError } from "@/shared/lib/action-error";

// The journey lifecycle record for one flight plan — visible to the
// request's owner and to reviewers.
export async function getFlightJourneyDetails(
  flightPlanId: string,
): Promise<FlightJourneyDetails | null> {
  const viewer = await getCurrentAuthorizationProfile();

  if (!viewer || !isApproved(viewer)) {
    throw new Error("You do not have permission to view flight journeys.");
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("flight_journeys")
    .select(
      "status, commenced_at, terminated_at, cancelled_at, commenced_by_profile:profiles!flight_journeys_commenced_by_fkey(full_name), terminated_by_profile:profiles!flight_journeys_terminated_by_fkey(full_name), cancelled_by_profile:profiles!flight_journeys_cancelled_by_fkey(full_name), flight_requests!inner(flight_plan_id, requested_by, approved_at, approved_by_profile:profiles!flight_requests_approved_by_fkey(full_name))",
    )
    .eq("flight_requests.flight_plan_id", flightPlanId)
    .maybeSingle();

  if (error) {
    throw new Error(describeActionError(error));
  }

  if (!data) {
    return null;
  }

  const isOwner = data.flight_requests.requested_by === viewer.id;

  if (!isOwner && !canViewFlightDocumentRecords(viewer)) {
    return null;
  }

  return {
    status: data.status as JourneyStatus,
    commencedAt: data.commenced_at,
    commencedByName: data.commenced_by_profile?.full_name ?? null,
    terminatedAt: data.terminated_at,
    terminatedByName: data.terminated_by_profile?.full_name ?? null,
    cancelledAt: data.cancelled_at,
    cancelledByName: data.cancelled_by_profile?.full_name ?? null,
    approvedAt: data.flight_requests.approved_at,
    approvedByName:
      data.flight_requests.approved_by_profile?.full_name ?? null,
  };
}
