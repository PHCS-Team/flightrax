"use client";

import { PlaneIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";

import { AircraftHeaderCard } from "@/modules/flight-documents/components/aircraft-header-card";
import { FlightPlanForm } from "@/modules/flight-documents/components/flight-plan-form";
import { FlightPlanHelp } from "@/modules/flight-documents/components/flight-plan-help-dialog";
import { FlightPlanSavedDialog } from "@/modules/flight-documents/components/flight-plan-saved-dialog";
import { FlightPlanSavingDialog } from "@/modules/flight-documents/components/flight-plan-saving-dialog";
import { useCreateFlightPlan } from "@/modules/flight-documents/hooks/use-create-flight-plan.action";
import { useFlightPlanAircraft } from "@/modules/flight-documents/hooks/use-flight-plan-aircraft.query";
import { useFlightPlanFilerContext } from "@/modules/flight-documents/hooks/use-filer-context.query";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { Button } from "@/shared/components/ui/button";
import { TooltipProvider } from "@/shared/components/ui/tooltip";

export function FlightPlanCreateClientSurface() {
  const router = useRouter();
  const [aircraftId] = useQueryState("aircraft", parseAsString.withDefault(""));
  const [savedDialogOpen, setSavedDialogOpen] = useState(false);
  const [savedPlanId, setSavedPlanId] = useState<string | null>(null);
  const { aircraft, error, isPending } = useFlightPlanAircraft(aircraftId);
  const {
    filerContext,
    error: filerError,
    isPending: filerPending,
  } = useFlightPlanFilerContext();
  const createFlightPlan = useCreateFlightPlan({
    onSaved: (flightPlanId) => {
      setSavedPlanId(flightPlanId ?? null);
      setSavedDialogOpen(true);
    },
  });

  if ((aircraftId && isPending) || filerPending) {
    return <LoadingScreen />;
  }

  if (error || filerError) {
    return (
      <EmptyState
        description={(error ?? filerError)?.message ?? ""}
        icon={<PlaneIcon className="size-7" />}
        title="Flight plan could not be loaded"
      />
    );
  }

  if (
    filerContext &&
    (!filerContext.hasSignature || !filerContext.hasValidLicense)
  ) {
    return (
      <EmptyState
        action={
          <Button onClick={() => router.push("/account")} type="button">
            Go to account settings
          </Button>
        }
        description={[
          !filerContext.hasSignature
            ? "Set your signature — saving a flight plan automatically signs it."
            : null,
          !filerContext.hasValidLicense
            ? "Add an active, non-expired license to your account."
            : null,
        ]
          .filter(Boolean)
          .join(" ")}
        icon={<PlaneIcon className="size-7" />}
        title="Set This Data First"
      />
    );
  }

  if (!aircraft) {
    return (
      <EmptyState
        action={
          <Button
            onClick={() => router.push("/flight-documents")}
            type="button"
          >
            Back to flight documents
          </Button>
        }
        description="Choose an aircraft from the flight documents page to start a flight plan."
        icon={<PlaneIcon className="size-7" />}
        title="No Aircraft Selected"
      />
    );
  }

  return (
    <TooltipProvider>
      <div className="sm:space-y-4">
        <AircraftHeaderCard aircraft={aircraft} />

        <GlassSurface className="p-4 sm:p-6">
          <FlightPlanForm
            cancelLabel="Back to flight documents"
            isSubmitting={createFlightPlan.isExecuting}
            onCancel={() => router.push("/flight-documents")}
            onSubmit={(values) =>
              createFlightPlan.execute({ ...values, aircraftId: aircraft.id })
            }
            submitLabel="Save as draft"
          />
        </GlassSurface>

        <FlightPlanHelp />

        <FlightPlanSavingDialog open={createFlightPlan.isExecuting} />

        <FlightPlanSavedDialog
          description="Your flight plan is saved as a draft. You can fill up the Weight & Balance form anytime the data is available — you can always come back to it from Flight Documents."
          onBackToList={() => router.replace("/flight-documents")}
          onClose={() => {
            if (savedPlanId) {
              router.replace(`/flight-documents/flight-plans/${savedPlanId}`);

              return;
            }

            setSavedDialogOpen(false);
          }}
          onProceedToWeightBalance={
            savedPlanId
              ? () =>
                  router.replace(
                    `/flight-documents/flight-plans/${savedPlanId}/weight-balance`,
                  )
              : undefined
          }
          open={savedDialogOpen}
        />
      </div>
    </TooltipProvider>
  );
}
