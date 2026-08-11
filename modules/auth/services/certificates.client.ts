import type { Certificate } from "@/modules/auth/types/certificate";
import { getApiErrorMessage } from "@/shared/lib/api-error";

export async function fetchOwnCertificates(): Promise<Certificate[]> {
  const response = await fetch("/api/auth/certificates", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load certificates."),
    );
  }

  return (await response.json()) as Certificate[];
}
