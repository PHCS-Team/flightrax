// One entry on the account Logs tab — a flight that reached the end of
// its lifecycle: completed (arrived, or already swept to standby) or
// cancelled. Both are log history.
export type AccountFlightLog = {
  journeyId: string;
  flightPlanId: string;
  journeyStatus: "arrived" | "standby" | "cancelled";
  aircraftIdentification: string;
  departureAerodrome: string;
  destinationAerodrome: string;
  dofDate: string | null;
  commencedAt: string | null;
  terminatedAt: string | null;
  cancelledAt: string | null;
  photoUrl: string | null;
};
