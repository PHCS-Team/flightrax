"use client";

import {
  CircleCheckIcon,
  ImageIcon,
  Loader2Icon,
  PlaneIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";

import { FlightPlanForm } from "@/modules/flight-documents/components/flight-plan-form";
import { FlightPlanHelp } from "@/modules/flight-documents/components/flight-plan-help-dialog";
import { useCreateFlightPlan } from "@/modules/flight-documents/hooks/use-create-flight-plan.action";
import { useFlightPlanAircraft } from "@/modules/flight-documents/hooks/use-flight-plan-aircraft.query";
import { useFlightPlanFilerContext } from "@/modules/flight-documents/hooks/use-filer-context.query";
import type { FlightPlanAircraftOption } from "@/modules/flight-documents/types/aircraft-option";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { TooltipProvider } from "@/shared/components/ui/tooltip";

export function FlightPlanCreateClientSurface() {
  const router = useRouter();
  const [aircraftId] = useQueryState("aircraft", parseAsString.withDefault(""));
  const [savedDialogOpen, setSavedDialogOpen] = useState(false);
  const { aircraft, error, isPending } = useFlightPlanAircraft(aircraftId);
  const {
    filerContext,
    error: filerError,
    isPending: filerPending,
  } = useFlightPlanFilerContext();
  const createFlightPlan = useCreateFlightPlan({
    onSaved: () => setSavedDialogOpen(true),
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
      <div className="sm:space-y-6">
        <AircraftHeaderCard aircraft={aircraft} />

        <GlassSurface className="p-4 sm:p-6">
          <FlightPlanForm
            isSubmitting={createFlightPlan.isExecuting}
            onCancel={() => router.push("/flight-documents")}
            onSubmit={(values) =>
              createFlightPlan.execute({ ...values, aircraftId: aircraft.id })
            }
            submitLabel="Save as draft"
          />
        </GlassSurface>

        <FlightPlanHelp />

        <Dialog open={createFlightPlan.isExecuting}>
          <DialogContent
            className="sm:max-w-xs"
            onEscapeKeyDown={(event) => event.preventDefault()}
            onInteractOutside={(event) => event.preventDefault()}
            showCloseButton={false}
          >
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <Loader2Icon className="size-8 animate-spin text-primary" />
              <p className="text-sm font-semibold text-foreground">
                Saving your flight plan...
              </p>
              <p className="text-xs text-muted-foreground">
                Please wait — do not close or leave this page.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={savedDialogOpen}>
          <DialogContent
            className="sm:max-w-md"
            onEscapeKeyDown={(event) => event.preventDefault()}
            onInteractOutside={(event) => event.preventDefault()}
            showCloseButton={false}
          >
            <div className="flex flex-col items-center gap-3 pt-4 text-center">
              <CircleCheckIcon className="size-10 text-primary" />
              <p className="text-lg font-semibold text-foreground">
                Flight Plan Saved
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Your flight plan is saved as a draft. You can fill up the Weight
                &amp; Balance form on site — no need to worry, you can always
                come back to it later from Flight Documents.
              </p>
            </div>
            <div className="mt-2 grid gap-2">
              <Button disabled type="button">
                Proceed to Weight &amp; Balance
              </Button>
              <p className="-mt-1 text-center text-[10px] text-muted-foreground">
                Available once the Weight &amp; Balance phase ships.
              </p>
              <Button
                onClick={() => router.push("/flight-documents")}
                type="button"
                variant="outline"
              >
                Go back to flight documents
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

function AircraftHeaderCard({
  aircraft,
}: {
  aircraft: FlightPlanAircraftOption;
}) {
  return (
    <div className="relative h-44 overflow-hidden border-y border-primary-foreground/20 bg-primary shadow-sm sm:h-56 sm:rounded-3xl sm:border">
      {aircraft.photoUrl ? (
        <div
          aria-label={`${aircraft.aircraftIdentification} aircraft image`}
          className="absolute inset-0 bg-cover bg-center"
          role="img"
          style={{ backgroundImage: `url(${aircraft.photoUrl})` }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="size-10 text-primary-foreground/30" />
        </div>
      )}
      <div className="absolute inset-0 bg-linear-to-t from-primary via-primary/50 to-primary/10" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-primary-foreground sm:p-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {aircraft.aircraftIdentification}
          </h2>
          <span className="inline-flex shrink-0 items-center rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-2 py-0.5 text-xs font-medium text-primary-foreground/90">
            {aircraft.typeName}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-primary-foreground/80">
          {aircraft.model}
        </p>
        <p className="mt-0.5 text-xs text-primary-foreground/60">
          {aircraft.colorMarkings}
        </p>
      </div>
    </div>
  );
}
