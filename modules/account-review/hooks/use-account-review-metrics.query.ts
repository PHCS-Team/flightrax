"use client";

import { useQuery } from "@tanstack/react-query";

import { accountReviewMetricsQueryOptions } from "@/modules/account-review/queries/account-review";

export function useAccountReviewMetrics() {
  return useQuery(accountReviewMetricsQueryOptions());
}
