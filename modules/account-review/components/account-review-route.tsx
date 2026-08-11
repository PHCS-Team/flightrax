import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { AccountReviewPage } from "@/modules/account-review/components/account-review-page";
import { ACCOUNT_REVIEW_QUERY_KEYS } from "@/modules/account-review/queries/query-keys";
import {
  getAccountReviewItems,
  getAccountReviewMetrics,
} from "@/modules/account-review/services/account-review.server";
import { ACCOUNT_REQUEST_ROLES } from "@/shared/lib/rbac/config";
import { getQueryClient } from "@/shared/lib/query-client";

export async function AccountReviewRoute() {
  const queryClient = getQueryClient();
  const defaultType = ACCOUNT_REQUEST_ROLES[0];

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ACCOUNT_REVIEW_QUERY_KEYS.list(defaultType),
      queryFn: () => getAccountReviewItems(defaultType),
    }),
    queryClient.prefetchQuery({
      queryKey: ACCOUNT_REVIEW_QUERY_KEYS.metrics,
      queryFn: getAccountReviewMetrics,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AccountReviewPage />
    </HydrationBoundary>
  );
}
