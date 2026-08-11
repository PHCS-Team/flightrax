import type {
  AccountReviewItem,
  AccountReviewMetrics,
} from "@/modules/account-review/types/account-review";
import type { AccountRequestRole } from "@/shared/lib/rbac/config";
import { getApiErrorMessage } from "@/shared/lib/api-error";

export async function fetchAccountReviewItems(type: AccountRequestRole) {
  const response = await fetch(`/api/account-review?type=${type}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Unable to load account review requests.",
      ),
    );
  }

  return (await response.json()) as AccountReviewItem[];
}

export async function fetchAccountReviewMetrics() {
  const response = await fetch("/api/account-review/metrics", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Unable to load account review metrics.",
      ),
    );
  }

  return (await response.json()) as AccountReviewMetrics;
}
