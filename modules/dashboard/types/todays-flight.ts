import type { JourneyStatus } from "@/modules/dashboard/types/flight-status";
import type { Database } from "@/shared/types/supabase";

export type TodaysFlightRpcRow =
  Database["public"]["Functions"]["get_todays_flights"]["Returns"][number];

export type TodaysFlightRow = {
  journeyId: string;
  journeyStatus: JourneyStatus;
  flightRequestId: string;
  flightPlanId: string;
  requestedById: string;
  aircraftIdentification: string;
  departureAerodrome: string;
  destinationAerodrome: string;
  departureTimeRaw: string;
  commencedAt: string | null;
  traineeName: string;
  pilotInCommandName: string;
};
