"use client";

import { HourglassIcon } from "lucide-react";

import { useCancelFlightRequest } from "@/modules/flight-documents/hooks/use-cancel-flight-request.action";
import { Button } from "@/shared/components/ui/button";

export function PendingApprovalAlert({
  flightPlanId,
}: {
  flightPlanId: string;
}) {
  const cancelRequest = useCancelFlightRequest();

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-1.5 text-xs text-primary-foreground/80">
        <HourglassIcon className="mt-0.5 size-3.5 shrink-0" />
        <p>
          This flight plan is currently pending approval and can&apos;t be
          edited. Need to change something? Cancel the request to move it back
          to draft, correct it, then resubmit.
        </p>
      </div>
      <Button
        className="shrink-0 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground disabled:cursor-default"
        disabled={cancelRequest.isExecuting}
        onClick={() => cancelRequest.execute({ flightPlanId })}
        size="sm"
        type="button"
        variant="outline"
      >
        {cancelRequest.isExecuting ? "Cancelling..." : "Cancel request"}
      </Button>
    </div>
  );
}
