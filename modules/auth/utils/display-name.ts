export function parseDisplayName(fullName: string) {
  const [lastName, givenNames] = fullName.split(",").map((part) => part.trim());

  if (!lastName || !givenNames) {
    return {
      lastName: fullName,
      givenNames: "FlightraX profile",
    };
  }

  return { lastName, givenNames };
}
