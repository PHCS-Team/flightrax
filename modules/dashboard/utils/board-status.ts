import type {
  AircraftStatus,
  DashboardBoardStatus,
  JourneyStatus,
} from "@/modules/dashboard/types/flight-status";

export function deriveBoardStatus(
  aircraftStatus: AircraftStatus,
  journeyStatus: JourneyStatus | null,
): DashboardBoardStatus {
  if (aircraftStatus === "maintenance" || aircraftStatus === "grounded") {
    return "on_ground";
  }

  if (journeyStatus === "active") {
    return "active";
  }

  if (journeyStatus === "scheduled") {
    return "scheduled";
  }

  // standby journeys never reach the board — its query excludes them.
  if (journeyStatus === "arrived") {
    return "arrived";
  }

  return "standby";
}
