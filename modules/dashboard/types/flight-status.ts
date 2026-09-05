import type { Database } from "@/shared/types/supabase";

export type JourneyStatus = Database["public"]["Enums"]["journey_status"];

export type DashboardFlightStatusRpcRow =
  Database["public"]["Functions"]["get_dashboard_flight_status"]["Returns"][number];

export type DashboardStatusGroup = "all" | "active" | "arrived" | "on_ground";

export type DashboardBoardStatus = "active" | "on_ground" | "arrived";

export type DashboardFlightJourney = {
  id: string;
  flightPlanId: string;
  status: JourneyStatus;
  dofAt: string | null;
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
  instructorName: string;
};

export type DashboardFlightStatusRow = {
  aircraftId: string;
  registrationNumber: string;
  registrationMark: string;
  typeName: string;
  typeIcaoDesignator: string;
  photoUrl: string | null;
  boardStatus: DashboardBoardStatus;
  journey: DashboardFlightJourney;
};
