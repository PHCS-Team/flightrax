import type {
  FLIGHT_REQUEST_STATUS_GROUPS,
  FLIGHT_REQUEST_STATUS_OPTIONS,
} from "@/modules/flight-documents/constants/flight-request-options";
import type { Database } from "@/shared/types/supabase";

export type FlightRequestRow =
  Database["public"]["Tables"]["flight_requests"]["Row"];
export type FlightRequestInsert =
  Database["public"]["Tables"]["flight_requests"]["Insert"];
export type FlightRequestUpdate =
  Database["public"]["Tables"]["flight_requests"]["Update"];

export type FlightJourneyRow =
  Database["public"]["Tables"]["flight_journeys"]["Row"];
export type FlightJourneyInsert =
  Database["public"]["Tables"]["flight_journeys"]["Insert"];
export type FlightJourneyUpdate =
  Database["public"]["Tables"]["flight_journeys"]["Update"];

export type FlightRequestStatus =
  (typeof FLIGHT_REQUEST_STATUS_OPTIONS)[number]["value"];

export type JourneyStatus = Database["public"]["Enums"]["journey_status"];

export type FlightRequestReviewScope = "assigned" | "all";

export type FlightRequestStatusGroup =
  keyof typeof FLIGHT_REQUEST_STATUS_GROUPS;

export type FlightRequestListItem = {
  id: string;
  flightPlanId: string;
  status: FlightRequestStatus;
  rejectedReason: string | null;
  planCode: string;
  aircraftIdentification: string;
  typeOfAircraft: string;
  aircraftPhotoUrl: string | null;
  departureAerodrome: string;
  destinationAerodrome: string;
  dofRaw: string;
  dofResolved: string;
  departureTimeRaw: string;
  createdAt: string;
  updatedAt: string;
  hasWeightBalance: boolean;
};

export type FlightRequestReviewListItem = FlightRequestListItem & {
  requestedByName: string;
  pilotInCommandName: string;
};

// Journey lifecycle record shown on the read-only flight log preview.
export type FlightJourneyDetails = {
  status: JourneyStatus;
  commencedAt: string | null;
  terminatedAt: string | null;
  cancelledAt: string | null;
};
