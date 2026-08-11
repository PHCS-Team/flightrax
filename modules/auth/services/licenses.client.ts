import type { License } from "@/shared/types/license";
import { getApiErrorMessage } from "@/shared/lib/api-error";

export async function fetchOwnLicenses() {
  const response = await fetch("/api/auth/licenses", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load licenses."),
    );
  }

  return (await response.json()) as License[];
}
