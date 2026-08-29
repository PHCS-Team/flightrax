"use client";

import { useMemo, useState } from "react";
import { ClipboardCheckIcon, SearchIcon } from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";

import { AccountReviewList } from "@/modules/account-review/components/account-review-list";
import { AccountReviewMetrics } from "@/modules/account-review/components/account-review-metrics";
import { useAccountReview } from "@/modules/account-review/hooks/use-account-review.query";
import { matchesReviewSearch } from "@/modules/account-review/utils/search";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { Input } from "@/shared/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ACCOUNT_REQUEST_ROLES, ROLE_LABELS } from "@/shared/lib/rbac/config";
import type { AccountRequestRole } from "@/shared/lib/rbac/config";

export function AccountReviewClientSurface() {
  const [type, setType] = useQueryState(
    "type",
    parseAsStringLiteral(ACCOUNT_REQUEST_ROLES).withDefault(
      ACCOUNT_REQUEST_ROLES[0],
    ),
  );
  const [search, setSearch] = useState("");
  const { error, isPending, requests } = useAccountReview(type);
  const filteredRequests = useMemo(
    () => requests.filter((request) => matchesReviewSearch(request, search)),
    [requests, search],
  );

  return (
    <div className="space-y-4">
      <div className="sm:space-y-4">
        <Tabs
          onValueChange={(value) => setType(value as AccountRequestRole)}
          value={type}
        >
          <TabsList className="w-full justify-start border-x-0 md:w-fit md:border-x border-y border-primary-foreground/15 p-1.5">
            {ACCOUNT_REQUEST_ROLES.map((role) => (
              <TabsTrigger key={role} value={role}>
                {ROLE_LABELS[role]}s
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <AccountReviewMetrics type={type} />
      </div>

      <div className="flex flex-col gap-3 px-2.5 -mt-1 mb-3 sm:flex-row sm:items-center sm:justify-between sm:px-0">
        <div className="relative w-full max-w-xl">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-primary-foreground/55" />
          <Input
            className="border-primary-foreground/20 bg-primary-foreground/10 pl-11 text-primary-foreground placeholder:text-primary-foreground/55 focus-visible:border-primary-foreground/45 focus-visible:ring-primary-foreground/20"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, ID number, status, or rejection reason"
            value={search}
          />
        </div>
        {!isPending && !error && (
          <p className="hidden sm:block text-sm text-primary-foreground/70">
            {filteredRequests.length} of {requests.length} requests
          </p>
        )}
      </div>

      {isPending ? (
        <LoadingScreen />
      ) : error ? (
        <EmptyState
          description={error.message}
          icon={<ClipboardCheckIcon className="size-7" />}
          title="Account requests could not be loaded"
        />
      ) : (
        <AccountReviewList
          hasActiveSearch={search.trim().length > 0}
          onClearSearch={() => setSearch("")}
          requests={filteredRequests}
        />
      )}
    </div>
  );
}
