"use client";

import { useQuery } from "@tanstack/react-query";

import { accountReviewQueryOptions } from "@/modules/account-review/queries/account-review";
import type { AccountRequestRole } from "@/shared/lib/rbac/config";

export function useAccountReview(type: AccountRequestRole) {
  const query = useQuery(accountReviewQueryOptions(type));

  return {
    ...query,
    requests: query.data ?? [],
  };
}
