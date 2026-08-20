"use client";

import { FileTextIcon, PlaneTakeoffIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";

import { AircraftSelectDialog } from "@/modules/flight-documents/components/aircraft-select-dialog";
import { useFlightPlanFilerContext } from "@/modules/flight-documents/hooks/use-filer-context.query";
import { useOwnFlightRequests } from "@/modules/flight-documents/hooks/use-flight-requests.query";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { Button } from "@/shared/components/ui/button";

const PAGE_SIZE = 9;

export function FlightDocumentsClientSurface() {
  const router = useRouter();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [aircraftDialogOpen, setAircraftDialogOpen] = useState(false);
  const { requests, totalCount, totalPages, error, isPending } =
    useOwnFlightRequests(page, PAGE_SIZE, "draft");
  const { filerContext } = useFlightPlanFilerContext();
  const canFile = Boolean(
    filerContext?.hasSignature && filerContext?.hasValidLicense,
  );

  if (isPending) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <EmptyState
        description={error.message}
        icon={<FileTextIcon className="size-7" />}
        title="Flight plans could not be loaded"
      />
    );
  }

  return (
    <>
      <GlassSurface className="space-y-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary-foreground">
              Draft Flight Plans
            </h2>
            <p className="text-sm text-primary-foreground/70">
              {totalCount} draft{totalCount !== 1 ? "s" : ""} — file the
              matching W&B on site to submit for approval.
            </p>
          </div>
          <Button
            className="px-4 font-semibold disabled:cursor-default"
            disabled={!canFile}
            onClick={() => setAircraftDialogOpen(true)}
            type="button"
          >
            <PlusIcon className="size-4" />
            File flight plan
          </Button>
        </div>

        {filerContext && !canFile && (
          <div className="flex flex-col gap-2 rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-primary-foreground/80">
              Set this data first before filing a flight plan:{" "}
              {[
                !filerContext.hasSignature ? "your signature" : null,
                !filerContext.hasValidLicense
                  ? "an active, non-expired license"
                  : null,
              ]
                .filter(Boolean)
                .join(" and ")}
              . Flight plans are auto-signed with your registered signature.
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
        )}

        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 py-12 text-center">
            <FileTextIcon className="size-8 text-primary-foreground/40" />
            <p className="text-sm font-medium text-primary-foreground">
              No draft flight plans yet
            </p>
            <p className="max-w-sm text-xs text-primary-foreground/60">
              Start by filing a flight plan for your scheduled flight — it
              stays a draft until the weight and balance is added on site.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {requests.map((request) => (
              <div
                className="relative h-44 overflow-hidden rounded-2xl border border-primary-foreground/15 bg-primary"
                key={request.id}
              >
                {request.aircraftPhotoUrl ? (
                  <div
                    aria-label={`${request.aircraftIdentification} aircraft image`}
                    className="absolute inset-0 bg-cover bg-center"
                    role="img"
                    style={{
                      backgroundImage: `url(${request.aircraftPhotoUrl})`,
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlaneTakeoffIcon className="size-8 text-primary-foreground/25" />
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-primary via-primary/60 to-primary/15" />

                <span className="absolute right-2.5 top-2.5 inline-flex items-center rounded-full border border-primary-foreground/30 bg-primary/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary-foreground">
                  Draft
                </span>

                <div className="absolute inset-x-0 bottom-0 p-3.5 text-primary-foreground">
                  <p className="truncate font-semibold">
                    {request.aircraftIdentification}
                  </p>
                  <p className="truncate text-xs text-primary-foreground/70">
                    {request.typeOfAircraft}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                    <span>{request.departureAerodrome}</span>
                    <PlaneTakeoffIcon className="size-3.5 text-primary-foreground/60" />
                    <span>{request.destinationAerodrome}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-primary-foreground/70">
                    <span>
                      DOF{" "}
                      <span className="font-semibold text-primary-foreground/90">
                        {request.dofRaw}
                      </span>
                    </span>
                    <span>
                      Updated{" "}
                      {new Date(request.updatedAt).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" },
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-primary-foreground/70">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground disabled:cursor-default disabled:border-primary-foreground/10 disabled:bg-primary-foreground/5 disabled:text-primary-foreground/50"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                type="button"
                variant="outline"
              >
                Previous
              </Button>
              <Button
                className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground disabled:cursor-default disabled:border-primary-foreground/10 disabled:bg-primary-foreground/5 disabled:text-primary-foreground/50"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                type="button"
                variant="outline"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </GlassSurface>

      <AircraftSelectDialog
        onOpenChange={setAircraftDialogOpen}
        open={aircraftDialogOpen}
      />
    </>
  );
}
