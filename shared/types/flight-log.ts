// One flight-history entry — a journey that reached the end of its
// lifecycle: completed (arrived, or already swept to standby) or
// cancelled. Rendered by the account Logs tab and the admin Flight
// Plans audit list.
export type FlightLogEntry = {
  journeyId: string;
  flightPlanId: string;
  journeyStatus: "arrived" | "standby" | "cancelled";
  aircraftIdentification: string;
  departureAerodrome: string;
  destinationAerodrome: string;
  dofDate: string | null;
  commencedAt: string | null;
  commencedByName: string | null;
  terminatedAt: string | null;
  terminatedByName: string | null;
  cancelledAt: string | null;
  cancelledByName: string | null;
  approvedAt: string | null;
  approvedByName: string | null;
  photoUrl: string | null;
};
