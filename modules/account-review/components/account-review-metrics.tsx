"use client";

import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  Clock3Icon,
  type LucideIcon,
} from "lucide-react";

import { useAccountReviewMetrics } from "@/modules/account-review/hooks/use-account-review-metrics.query";
import type { AccountReviewStatusCounts } from "@/modules/account-review/types/account-review";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import type { AccountRequestRole } from "@/shared/lib/rbac/config";

const METRIC_CARDS: Array<{
  icon: LucideIcon;
  key: keyof AccountReviewStatusCounts;
  label: string;
  mobileLabel: string;
}> = [
  { icon: Clock3Icon, key: "pending", label: "Pending Review", mobileLabel: "Pending" },
  { icon: CheckCircle2Icon, key: "approved", label: "Approved", mobileLabel: "Approved" },
  { icon: AlertTriangleIcon, key: "rejected", label: "Rejected", mobileLabel: "Rejected" },
];

export function AccountReviewMetrics({ type }: { type: AccountRequestRole }) {
  const { data: metrics, isPending } = useAccountReviewMetrics();
  const counts = metrics?.[type];

  function renderValue(key: keyof AccountReviewStatusCounts) {
    if (counts) {
      return counts[key];
    }

    return (
      <span
        aria-label="Loading"
        className={isPending ? "animate-pulse" : undefined}
      >
        —
      </span>
    );
  }

  return (
    <>
      <GlassSurface className="p-0 sm:hidden">
        <div className="grid grid-cols-3 divide-x divide-primary-foreground/15">
          {METRIC_CARDS.map((card) => (
            <div
              className="flex flex-col items-center gap-0.5 px-2 py-3 text-center"
              key={card.key}
            >
              <p className="truncate text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-primary-foreground/60">
                {card.mobileLabel}
              </p>
              <p className="text-xl font-semibold tracking-tight text-primary-foreground">
                {renderValue(card.key)}
              </p>
            </div>
          ))}
        </div>
      </GlassSurface>

      <div className="hidden gap-3 sm:grid sm:grid-cols-3">
        {METRIC_CARDS.map((card) => {
          const CardIcon = card.icon;

          return (
            <GlassSurface className="p-5" key={card.key}>
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground">
                  <CardIcon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary-foreground/60">
                    {card.label}
                  </p>
                  <p className="mt-0.5 text-2xl font-semibold tracking-tight text-primary-foreground">
                    {renderValue(card.key)}
                  </p>
                </div>
              </div>
            </GlassSurface>
          );
        })}
      </div>
    </>
  );
}
