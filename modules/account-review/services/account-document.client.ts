import { getApiErrorMessage } from "@/shared/lib/api-error";

export async function fetchAccountDocumentUrl(requestId: string) {
  const response = await fetch(`/api/account-review/${requestId}/document`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load document preview."),
    );
  }

  const { documentUrl } = (await response.json()) as { documentUrl: string };

  return documentUrl;
}
