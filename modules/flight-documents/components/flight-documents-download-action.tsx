"use client";

import { useDownloadFlightDocuments } from "@/modules/flight-documents/hooks/use-download-flight-documents";
import { useWeightBalanceContext } from "@/modules/flight-documents/hooks/use-weight-balance-context.query";
import { DownloadFlightDocumentsAction } from "@/shared/components/layout/download-flight-documents-action";

export function FlightDocumentsDownloadAction({
  flightPlanId,
}: {
  flightPlanId: string;
}) {
  const { download, pending } = useDownloadFlightDocuments(flightPlanId);
  const { context } = useWeightBalanceContext(flightPlanId);
  const hasWeightBalance = Boolean(context?.existing);

  return (
    <DownloadFlightDocumentsAction
      busyLabel={
        pending
          ? pending === "both"
            ? "Preparing both documents..."
            : pending === "weight-balance"
              ? "Preparing weight & balance..."
              : "Preparing flight plan..."
          : undefined
      }
      onDownloadBoth={hasWeightBalance ? () => download("both") : undefined}
      onDownloadFlightPlan={() => download("flight-plan")}
      onDownloadWeightBalance={
        hasWeightBalance ? () => download("weight-balance") : undefined
      }
    />
  );
}
