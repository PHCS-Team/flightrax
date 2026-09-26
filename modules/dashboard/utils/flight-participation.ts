// Who may commence, terminate, or cancel a flight: the person who filed
// the request, the pilot in command, or the assigned flight instructor.
// Superadmins bypass this in the actions.
export function isFlightParticipant(
  actorId: string,
  flight: {
    requestedBy: string | null;
    pilotInCommandId: string | null;
    instructorProfileId: string | null;
  },
): boolean {
  return (
    flight.requestedBy === actorId ||
    flight.pilotInCommandId === actorId ||
    flight.instructorProfileId === actorId
  );
}
