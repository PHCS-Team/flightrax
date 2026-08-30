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

  if (journeyStatus === "arrived" || journeyStatus === "terminated") {
    return "arrived";
  }

  return "standby";
}
