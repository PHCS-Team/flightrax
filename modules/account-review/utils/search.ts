import type { AccountReviewItem } from "@/modules/account-review/types/account-review";

export function matchesReviewSearch(
  request: AccountReviewItem,
  search: string,
) {
  const query = search.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return [
    request.fullName,
    request.email,
    request.idNumber,
    request.approvalStatus,
    request.rejectionReason,
  ]
    .filter((value): value is string => Boolean(value))
    .some((value) => value.toLowerCase().includes(query));
}
