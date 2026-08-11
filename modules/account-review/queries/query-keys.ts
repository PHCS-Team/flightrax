import type { AccountRequestRole } from "@/shared/lib/rbac/config";

export const ACCOUNT_REVIEW_QUERY_KEYS = {
  all: ["account-review"] as const,
  list: (type: AccountRequestRole) =>
    ["account-review", "list", { type }] as const,
  documentUrl: (requestId: string) =>
    ["account-review", "document", requestId] as const,
  metrics: ["account-review", "metrics"] as const,
};
