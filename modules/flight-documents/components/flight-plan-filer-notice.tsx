"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/shared/components/ui/button";

export function FlightPlanFilerNotice({
  blockers,
}: {
  blockers: string[];
}) {
  const router = useRouter();

  return (
    <div className="mx-4 mb-3 sm:mb-4 flex flex-col gap-2 rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 px-3 py-2.5 sm:mx-0 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-primary-foreground/80">
        Set this data first before filing a flight plan. {blockers.join(" ")}
      </p>
      <Button
        className="shrink-0 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
        onClick={() => router.push("/account")}
        size="sm"
        type="button"
        variant="outline"
      >
        Go to account settings
      </Button>
    </div>
  );
}
