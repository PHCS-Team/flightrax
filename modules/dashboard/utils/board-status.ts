import type {
  DashboardBoardStatus,
  DashboardFlightJourney,
  JourneyStatus,
} from "@/modules/dashboard/types/flight-status";
import { hmToMinutes } from "@/modules/dashboard/utils/format";

export function deriveBoardStatus(
  journeyStatus: JourneyStatus,
): DashboardBoardStatus {
  if (journeyStatus === "active") {
    return "active";
  }

  if (journeyStatus === "scheduled") {
    return "on_ground";
  }

  return "arrived";
}

// An active flight airborne longer than its filed total EET.
export function isJourneyPastEet(
  journey: Pick<DashboardFlightJourney, "status" | "commencedAt" | "totalEet">,
  nowMs: number,
): boolean {
  if (journey.status !== "active" || !journey.commencedAt || nowMs === 0) {
    return false;
  }

  const eetMinutes = hmToMinutes(journey.totalEet);

  if (eetMinutes === null) {
    return false;
  }

  const airborneMinutes = Math.floor(
    (nowMs - new Date(journey.commencedAt).getTime()) / 60000,
  );

  return airborneMinutes > eetMinutes;
}

// A scheduled flight whose filed DOF has passed without being commenced.
export function isJourneyOverdue(
  journeyStatus: JourneyStatus,
  dofAt: string | null,
  nowMs: number,
): boolean {
  return (
    journeyStatus === "scheduled" &&
    nowMs > 0 &&
    dofAt !== null &&
    new Date(dofAt).getTime() < nowMs
  );
}
