import type {
  DashboardBoardStatus,
  JourneyStatus,
} from "@/modules/dashboard/types/flight-status";

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
