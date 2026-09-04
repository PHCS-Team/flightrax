// Lightweight aircraft row for the flight plan aircraft picker and the
// creation page header. Only active aircraft are listed; availability
// additionally requires a W&B config, configured type specs, and no
// currently active flight.
export type FlightPlanAircraftOption = {
  id: string;
  aircraftIdentification: string;
  registrationMark: string;
  typeKey: string;
  typeName: string;
  typeIcaoDesignator: string;
  colorMarkings: string;
  photoUrl: string | null;
  isAvailable: boolean;
  unavailableReason: string | null;
};

export type FlightPlanTypeOption = {
  typeKey: string;
  type: string;
};
