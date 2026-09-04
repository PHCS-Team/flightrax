import type { Database } from "@/shared/types/supabase";

export type AircraftStatus = Database["public"]["Enums"]["aircraft_status"];
export type JourneyStatus = Database["public"]["Enums"]["journey_status"];

export type DashboardFlightStatusRpcRow =
  Database["public"]["Functions"]["get_dashboard_flight_status"]["Returns"][number];

export type DashboardStatusGroup = "all" | "active" | "arrived" | "on_ground";

export type DashboardBoardStatus =
  | "active"
  | "scheduled"
  | "arrived"
  | "standby"
  | "on_ground";

export type DashboardFlightJourney = {
  status: JourneyStatus;
  commencedAt: string | null;
  terminatedAt: string | null;
  departureAerodrome: string;
  destinationAerodrome: string;
  departureTimeRaw: string;
  cruisingSpeed: string;
  cruisingLevel: string;
  totalEet: string;
  traineeName: string;
  pilotInCommandName: string;
};

export type DashboardFlightStatusRow = {
  aircraftId: string;
  registrationNumber: string;
  registrationMark: string;
  typeName: string;
  typeIcaoDesignator: string;
  photoUrl: string | null;
  aircraftStatus: AircraftStatus;
  boardStatus: DashboardBoardStatus;
  journey: DashboardFlightJourney | null;
};
