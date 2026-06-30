export function getAvatarFallback(source: string | null | undefined) {
  const text = source?.trim() || "FlightRax";
  const parts = text.split(/[,\s@._-]+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((part) => part.at(0)?.toUpperCase() ?? "")
    .join("");

  return initials || "FR";
}
