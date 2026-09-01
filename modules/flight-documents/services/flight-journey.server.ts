import "server-only";

import type {
  FlightJourneyDetails,
  JourneyStatus,
} from "@/modules/flight-documents/types/flight-request";
import { canReviewFlightRequests } from "@/modules/flight-documents/utils/can-review-flight-requests";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import { createAdminClient } from "@/shared/lib/supabase/admin";

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
      "status, commenced_at, terminated_at, cancelled_at, flight_requests!inner(flight_plan_id, requested_by)",
    )
    .eq("flight_requests.flight_plan_id", flightPlanId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const isOwner = data.flight_requests.requested_by === viewer.id;

  if (!isOwner && !canReviewFlightRequests(viewer)) {
    return null;
  }

  return {
    status: data.status as JourneyStatus,
    commencedAt: data.commenced_at,
    terminatedAt: data.terminated_at,
    cancelledAt: data.cancelled_at,
  };
}
