export function getAvatarFallback(source: string | null | undefined) {
  const text = source?.trim() || "FlightraX";
  const [lastName, givenNames] = text.split(",").map((part) => part.trim());
  const parts = givenNames
    ? [givenNames, lastName]
    : text.split(/[\s@._-]+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((part) => part.at(0)?.toUpperCase() ?? "")
    .join("");

  return initials || "FR";
}
