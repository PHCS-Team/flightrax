"use client";

import { format } from "date-fns";
import {
  BanIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  PlaneIcon,
  TowerControlIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useCancelFlight } from "@/modules/dashboard/hooks/use-cancel-flight.action";
import { useCommenceFlight } from "@/modules/dashboard/hooks/use-commence-flight.action";
import { useNowMs } from "@/modules/dashboard/hooks/use-now";
import { useTerminateFlight } from "@/modules/dashboard/hooks/use-terminate-flight.action";
import { useTodaysFlights } from "@/modules/dashboard/hooks/use-todays-flights.query";
import type { JourneyStatus } from "@/modules/dashboard/types/flight-status";
import type {
  EarlierScheduledFlight,
  TodaysFlightRow,
} from "@/modules/dashboard/types/todays-flight";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import {
  formatElapsedHm,
  formatShortPersonName,
  formatTimeOfDay,
  formatZuluTimeToLocal,
} from "@/modules/dashboard/utils/format";
import { ConfirmationDialog } from "@/shared/components/layout/confirmation-dialog";
import { PasscodeGatewayDialog } from "@/shared/components/layout/passcode-gateway-dialog";
import { useVerifyPasscode } from "@/shared/hooks/use-verify-passcode.action";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { cn } from "@/shared/lib/utils";

const PAGE_SIZE = 5;
const SEARCH_DEBOUNCE_MS = 300;

const JOURNEY_STATUS_PILLS: Partial<
  Record<JourneyStatus, { label: string; className: string }>
> = {
  scheduled: {
    label: "On Ground",
    className: "border-orange-200/50 bg-orange-500/80 text-white",
  },
  active: {
    label: "Active",
    className: "border-emerald-200/50 bg-emerald-600/80 text-white",
  },
  arrived: {
    label: "Arrived",
    className: "border-yellow-200/60 bg-yellow-500/80 text-white",
  },
};

type FlightActionType = "commence" | "terminate" | "cancel";

type PendingAction = {
  type: FlightActionType;
  flightRequestId: string;
  aircraftIdentification: string;
};

const PASSCODE_DESCRIPTIONS: Record<FlightActionType, string> = {
  commence: "Enter your 4-digit security passcode to commence this flight.",
  terminate: "Enter your 4-digit security passcode to terminate this flight.",
  cancel: "Enter your 4-digit security passcode to cancel this flight.",
};

export function TodaysFlightsDrawer({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );
  const [cancelConfirm, setCancelConfirm] = useState<
    (PendingAction & { passcode: string }) | null
  >(null);
  const [earlierBlock, setEarlierBlock] =
    useState<EarlierScheduledFlight | null>(null);
  const nowMs = useNowMs();
  const verifyPasscode = useVerifyPasscode();
  const commenceFlight = useCommenceFlight({
    onBlockedByEarlier: setEarlierBlock,
  });
  const terminateFlight = useTerminateFlight();
  const cancelFlight = useCancelFlight({
    onDone: () => setCancelConfirm(null),
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { error, isPending, rows, totalPages } = useTodaysFlights(
    page,
    PAGE_SIZE,
    search,
    open,
  );

  function handleVerified(passcode: string) {
    if (!pendingAction) {
      return;
    }

    // Cancelling gets a second, type-to-confirm gate after the passcode.
    if (pendingAction.type === "cancel") {
      setCancelConfirm({ ...pendingAction, passcode });
      setPendingAction(null);

      return;
    }

    const input = {
      flightRequestId: pendingAction.flightRequestId,
      passcode,
    };

    if (pendingAction.type === "commence") {
      commenceFlight.execute(input);
    } else {
      terminateFlight.execute(input);
    }

    setPendingAction(null);
  }

  return (
    <>
      <Sheet onOpenChange={onOpenChange} open={open}>
        <SheetContent
          className="gap-0 overflow-y-auto p-4 data-[side=right]:w-full data-[side=right]:sm:max-w-md sm:p-6"
          onEscapeKeyDown={(event) => {
            if (pendingAction || cancelConfirm || earlierBlock) {
              event.preventDefault();
            }
          }}
          onInteractOutside={(event) => {
            if (pendingAction || cancelConfirm || earlierBlock) {
              event.preventDefault();
            }
          }}
          side="right"
        >
          <SheetHeader className="p-0 text-left">
            <SheetTitle>Today&apos;s Flights</SheetTitle>
            <SheetDescription>Approved flights for today.</SheetDescription>
          </SheetHeader>

          <div className="mt-4 flex items-center gap-2">
            <Input
              className="flex-1"
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search registry or ICAO code"
              value={searchInput}
            />
            <Button
              aria-label="Previous page"
              className="size-9 shrink-0 md:size-10"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              size="icon"
              type="button"
              variant="outline"
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              aria-label="Next page"
              className="size-9 shrink-0 md:size-10"
              disabled={totalPages === 0 || page >= totalPages}
              onClick={() => setPage(page + 1)}
              size="icon"
              type="button"
              variant="outline"
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>

          <div className="mt-4 grid gap-3">
            {isPending ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Loading today&apos;s flights...
              </p>
            ) : error ? (
              <p className="py-10 text-center text-sm text-destructive">
                {error.message}
              </p>
            ) : rows.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <span className="flex size-12 items-center justify-center rounded-full border border-border bg-muted/50">
                  <TowerControlIcon className="size-6 text-muted-foreground" />
                </span>
                <p className="text-sm text-muted-foreground">
                  {search
                    ? "No flights match your search."
                    : "No flights for today."}
                </p>
              </div>
            ) : (
              rows.map((row) => (
                <TodaysFlightCard
                  isActing={
                    commenceFlight.isExecuting ||
                    terminateFlight.isExecuting ||
                    cancelFlight.isExecuting
                  }
                  nowMs={nowMs}
                  key={row.journeyId}
                  onAct={(type) =>
                    setPendingAction({
                      type,
                      flightRequestId: row.flightRequestId,
                      aircraftIdentification: row.aircraftIdentification,
                    })
                  }
                  row={row}
                />
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      <PasscodeGatewayDialog
        description={
          pendingAction ? PASSCODE_DESCRIPTIONS[pendingAction.type] : ""
        }
        isVerifying={verifyPasscode.status === "executing"}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setPendingAction(null);
          }
        }}
        onVerified={handleVerified}
        open={Boolean(pendingAction)}
        verify={async (passcode) => {
          const result = await verifyPasscode.executeAsync({ passcode });

          return result?.data;
        }}
      />

      <Dialog
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setEarlierBlock(null);
          }
        }}
        open={Boolean(earlierBlock)}
      >
        <DialogContent className="p-6 sm:max-w-md">
          <DialogSectionHeader
            description="An earlier flight on this aircraft is still on ground — it must commence or be cancelled before this flight can start."
            icon={TriangleAlertIcon}
            title="Earlier Flight Still On Ground"
          />
          {earlierBlock && (
            <>
              <div className="grid gap-1 rounded-lg border border-border bg-muted/30 p-3">
                <p className="font-semibold uppercase text-foreground">
                  {earlierBlock.aircraftIdentification}
                  {earlierBlock.dofAt &&
                    ` · ${format(new Date(earlierBlock.dofAt), "h:mm a")}`}
                </p>
                <p className="text-sm uppercase text-muted-foreground">
                  Trainee: {formatShortPersonName(earlierBlock.traineeName)}
                </p>
              </div>
              {!earlierBlock.canCancel && (
                <p className="text-xs text-muted-foreground">
                  This flight belongs to another pilot — ask an instructor to
                  cancel it if it will not fly.
                </p>
              )}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  onClick={() => setEarlierBlock(null)}
                  type="button"
                  variant="outline"
                >
                  Close
                </Button>
                {earlierBlock.canCancel && (
                  <Button
                    onClick={() => {
                      setPendingAction({
                        type: "cancel",
                        flightRequestId: earlierBlock.flightRequestId,
                        aircraftIdentification:
                          earlierBlock.aircraftIdentification,
                      });
                      setEarlierBlock(null);
                    }}
                    type="button"
                    variant="destructive"
                  >
                    Cancel that flight
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        confirmLabel="Cancel flight"
        confirmingLabel="Cancelling..."
        description={`The on-ground ${cancelConfirm?.aircraftIdentification ?? ""} flight will be cancelled and the aircraft freed for a new request. This cannot be undone.`}
        icon={BanIcon}
        isConfirming={cancelFlight.isExecuting}
        onConfirm={() => {
          if (cancelConfirm) {
            cancelFlight.execute({
              flightRequestId: cancelConfirm.flightRequestId,
              passcode: cancelConfirm.passcode,
            });
          }
        }}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setCancelConfirm(null);
          }
        }}
        open={Boolean(cancelConfirm)}
        title="Cancel This Flight?"
        typeToConfirm="CANCEL"
      />
    </>
  );
}

function TodaysFlightCard({
  isActing,
  nowMs,
  onAct,
  row,
}: {
  isActing: boolean;
  nowMs: number;
  onAct: (type: FlightActionType) => void;
  row: TodaysFlightRow;
}) {
  const router = useRouter();
  const pill = JOURNEY_STATUS_PILLS[row.journeyStatus];
  const isOverdue =
    row.journeyStatus === "scheduled" &&
    nowMs > 0 &&
    Boolean(row.dofAt) &&
    new Date(row.dofAt ?? 0).getTime() < nowMs;

  const timeLine = row.commencedAt
    ? `Departed: ${formatElapsedHm(row.commencedAt)} ago`
    : `Will depart at ${
        row.dofAt
          ? formatTimeOfDay(row.dofAt)
          : formatZuluTimeToLocal(row.departureTimeRaw)
      }`;

  return (
    <div className="grid gap-1.5 rounded-lg border border-border bg-muted/30 p-2.5 sm:gap-2 sm:rounded-xl sm:p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-semibold uppercase text-foreground sm:text-base">
          {row.aircraftIdentification}
        </p>
        <span className="flex shrink-0 items-center gap-1.5">
          {isOverdue && (
            <span className="inline-flex items-center whitespace-nowrap rounded-full border border-red-200/40 bg-red-700/70 px-2 py-0.5 text-[10px] font-semibold text-red-50">
              Delayed
            </span>
          )}
          {pill && (
            <span
              className={cn(
                "inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                pill.className,
              )}
            >
              {pill.label}
            </span>
          )}
        </span>
      </div>

      <p className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-foreground">
        <PlaneIcon className="size-4 shrink-0 fill-muted-foreground text-muted-foreground" />
        <span className="truncate uppercase">
          {row.departureAerodrome} - {row.destinationAerodrome}
          <span className="font-normal text-muted-foreground">
            {" "}
            · {timeLine}
          </span>
        </span>
      </p>

      <p className="truncate text-xs uppercase text-muted-foreground">
        {formatShortPersonName(row.traineeName)} ·{" "}
        {formatShortPersonName(row.instructorName)}
        <span className="hidden sm:inline"> — trainee · instructor</span>
      </p>

      {row.journeyStatus === "scheduled" && (
        <div className="mt-0.5 grid grid-cols-2 gap-2">
          <Button
            className="h-8"
            disabled={isActing}
            onClick={() => onAct("commence")}
            size="sm"
            type="button"
          >
            Commence flight
          </Button>
          <Button
            className="h-8"
            disabled={isActing}
            onClick={() => onAct("cancel")}
            size="sm"
            type="button"
            variant="destructive"
          >
            Cancel flight
          </Button>
        </div>
      )}
      {row.journeyStatus === "active" && (
        <Button
          className="mt-0.5 h-8 w-full"
          disabled={isActing}
          onClick={() => onAct("terminate")}
          size="sm"
          type="button"
          variant="destructive"
        >
          Terminate flight
        </Button>
      )}
      {row.journeyStatus === "arrived" && (
        <Button
          className="mt-0.5 h-8 w-full"
          onClick={() =>
            router.replace(
              `/flight-documents/flight-plans/${row.flightPlanId}/log`,
            )
          }
          size="sm"
          type="button"
          variant="outline"
        >
          <FileTextIcon className="size-4" />
          Flight terminated — view flight log
        </Button>
      )}
    </div>
  );
}
