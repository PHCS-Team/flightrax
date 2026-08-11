import { queryOptions } from "@tanstack/react-query";

import { ACCOUNT_REVIEW_QUERY_KEYS } from "@/modules/account-review/queries/query-keys";
import { fetchAccountDocumentUrl } from "@/modules/account-review/services/account-document.client";
import {
  fetchAccountReviewItems,
  fetchAccountReviewMetrics,
} from "@/modules/account-review/services/account-review.client";
import type { AccountRequestRole } from "@/shared/lib/rbac/config";

export { ACCOUNT_REVIEW_QUERY_KEYS };

export function accountReviewQueryOptions(type: AccountRequestRole) {
  return queryOptions({
    queryFn: () => fetchAccountReviewItems(type),
    queryKey: ACCOUNT_REVIEW_QUERY_KEYS.list(type),
    staleTime: 5 * 60 * 1000,
  });
}

export function accountReviewMetricsQueryOptions() {
  return queryOptions({
    queryFn: fetchAccountReviewMetrics,
    queryKey: ACCOUNT_REVIEW_QUERY_KEYS.metrics,
    staleTime: 5 * 60 * 1000,
  });
}

export function accountDocumentQueryOptions(
  requestId: string,
  enabled: boolean,
) {
  return queryOptions({
    queryFn: () => fetchAccountDocumentUrl(requestId),
    queryKey: ACCOUNT_REVIEW_QUERY_KEYS.documentUrl(requestId),
    staleTime: 5 * 60 * 1000,
    enabled,
    retry: 1,
  });
}
