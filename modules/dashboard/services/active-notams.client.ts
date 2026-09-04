import { getApiErrorMessage } from "@/shared/lib/api-error";
import type { NotamSummary } from "@/shared/types/notam";

export async function fetchActiveNotams() {
  const response = await fetch("/api/dashboard/active-notams", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load NOTAMs."),
    );
  }

  return (await response.json()) as NotamSummary[];
}
