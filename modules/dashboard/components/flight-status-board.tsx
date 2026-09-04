"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageIcon,
  PlaneIcon,
  RadarIcon,
  type LucideIcon,
} from "lucide-react";
import { Fragment, useEffect, useState } from "react";

import { useNowMs } from "@/modules/dashboard/hooks/use-now";
import type {
  DashboardBoardStatus,
  DashboardFlightStatusRow,
} from "@/modules/dashboard/types/flight-status";
import { isJourneyOverdue } from "@/modules/dashboard/utils/board-status";
import {
  formatElapsedHm,
  formatShortPersonName,
  formatTimeOfDay,
} from "@/modules/dashboard/utils/format";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/utils";

export const BOARD_STATUS_META: Record<
  DashboardBoardStatus,
  {
    label: string;
    className: string;
    rowClassName: string;
    /** Row separator tinted to the status so it doesn't read as a gap. */
    borderClassName: string;
  }
> = {
  active: {
    label: "Active",
    className: "border-emerald-200/50 bg-emerald-600/80 text-white",
    rowClassName:
      "bg-linear-to-r from-emerald-700/60 via-emerald-600/20 to-transparent",
    borderClassName: "border-emerald-300/35",
  },
  // Scheduled for today, aircraft still preparing for departure.
  on_ground: {
    label: "On Ground",
    className: "border-orange-200/50 bg-orange-500/80 text-white",
    rowClassName:
      "bg-linear-to-r from-orange-700/60 via-orange-600/20 to-transparent",
    borderClassName: "border-orange-300/35",
  },
  arrived: {
    label: "Arrived",
    className: "border-yellow-200/60 bg-yellow-500/80 text-white",
    rowClassName:
      "bg-linear-to-r from-yellow-600/50 via-yellow-500/15 to-transparent",
    borderClassName: "border-yellow-300/35",
  },
};

const PILL_CLASS =
  "inline-flex items-center whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[10px] font-semibold sm:px-2.5 sm:text-xs";

// A scheduled flight past its filed DOF that has not been commenced.
export const OVERDUE_PILL_CLASS = cn(
  PILL_CLASS,
  "border-red-200/40 bg-red-700/70 text-red-50",
);

const PAGINATION_BUTTON_CLASS =
  "size-8 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground disabled:border-primary-foreground/10 disabled:bg-primary-foreground/5 disabled:text-primary-foreground/50";

export function FlightStatusBoard({
  emptyMessage = "No flights or maintenance to monitor today.",
  icon: Icon = RadarIcon,
  onPageChange,
  page,
  pageSize,
  rows,
  title = "Flight Status",
  totalPages,
}: {
  emptyMessage?: string;
  icon?: LucideIcon;
  onPageChange: (page: number) => void;
  page: number;
  pageSize: number;
  rows: DashboardFlightStatusRow[];
  title?: string;
  totalPages: number;
}) {
  const [expandedAircraftId, setExpandedAircraftId] = useState<string | null>(
    null,
  );
  const nowMs = useNowMs();

  useEffect(() => {
    for (const row of rows) {
      if (row.photoUrl) {
        const image = new window.Image();
        image.src = row.photoUrl;
      }
    }
  }, [rows]);

  const columns = [
    {
      accessorKey: "registrationMark",
      header: "Aircraft",
      cell: ({ row }) => (
        <div className="flex min-w-0 items-center gap-2">
          <span className="hidden size-8 shrink-0 items-center justify-center rounded-md border border-primary-foreground/15 bg-primary-foreground/10 sm:flex">
            <PlaneIcon className="size-4 fill-primary-foreground/70 text-primary-foreground/70" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold uppercase text-primary-foreground">
              {row.original.registrationMark}
            </p>
            <p className="truncate text-[11px] text-primary-foreground/60">
              {row.original.typeIcaoDesignator}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "remarks",
      header: "Remarks",
      cell: ({ row }) => {
        const meta = BOARD_STATUS_META[row.original.boardStatus];
        const overdue = isJourneyOverdue(
          row.original.journey.status,
          row.original.journey.dofAt,
          nowMs,
        );

        return (
          <span className="inline-flex flex-wrap items-center justify-center gap-1">
            <span className={cn(PILL_CLASS, meta.className)}>{meta.label}</span>
            {overdue && <span className={OVERDUE_PILL_CLASS}>Overdue</span>}
          </span>
        );
      },
    },
    {
      id: "trainee",
      header: "Trainee",
      cell: ({ row }) => (
        <p className="truncate text-sm uppercase text-primary-foreground/90">
          {formatShortPersonName(row.original.journey.traineeName)}
        </p>
      ),
    },
    {
      id: "instructor",
      header: "Instructor",
      cell: ({ row }) => (
        <p className="truncate text-sm uppercase text-primary-foreground/90">
          {formatShortPersonName(row.original.journey.pilotInCommandName)}
        </p>
      ),
    },
  ] satisfies ColumnDef<DashboardFlightStatusRow>[];

  const pagination: PaginationState = {
    pageIndex: page - 1,
    pageSize,
  };

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table exposes non-memoizable table helpers by design.
  const table = useReactTable({
    columns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(pagination) : updater;
      onPageChange(next.pageIndex + 1);
    },
    state: { pagination },
  });

  return (
    <GlassSurface className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 py-2 pl-4 pr-3 sm:py-2.5 sm:pl-6 sm:pr-4">
        <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight text-primary-foreground">
          <Icon className="size-4.5 text-primary-foreground/70" />
          {title}
        </h2>
        <div className="flex items-center gap-1.5">
          <Button
            aria-label="Previous page"
            className={PAGINATION_BUTTON_CLASS}
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="icon"
            type="button"
            variant="outline"
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button
            aria-label="Next page"
            className={PAGINATION_BUTTON_CLASS}
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            size="icon"
            type="button"
            variant="outline"
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </div>

      <Table className="table-fixed text-primary-foreground">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              className="border-primary-foreground/20 hover:bg-primary"
              key={headerGroup.id}
            >
              {headerGroup.headers.map((header, index) => (
                <TableHead
                  className={cn(
                    "bg-primary font-semibold text-primary-foreground",
                    index === 0 ? "w-[26%] pl-4 sm:pl-6" : "text-center",
                    index === 1 && "w-[28%]",
                    index === headerGroup.headers.length - 1 && "pr-4 sm:pr-6",
                  )}
                  key={header.id}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
                <TableRow
                  className={cn(
                    "cursor-pointer hover:bg-primary-foreground/10",
                    BOARD_STATUS_META[row.original.boardStatus].rowClassName,
                    BOARD_STATUS_META[row.original.boardStatus].borderClassName,
                  )}
                  onClick={() =>
                    setExpandedAircraftId((current) =>
                      current === row.original.aircraftId
                        ? null
                        : row.original.aircraftId,
                    )
                  }
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      className={cn(
                        "text-primary-foreground",
                        index === 0 ? "pl-4 sm:pl-6" : "text-center",
                        index === row.getVisibleCells().length - 1 &&
                          "pr-4 sm:pr-6",
                      )}
                      key={cell.id}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow
                  className={cn(
                    "hover:bg-transparent",
                    expandedAircraftId === row.original.aircraftId
                      ? BOARD_STATUS_META[row.original.boardStatus].borderClassName
                      : "border-0",
                  )}
                >
                  <TableCell className="p-0" colSpan={columns.length}>
                    <div
                      className={cn(
                        "grid transition-[grid-template-rows] duration-300 ease-in-out",
                        expandedAircraftId === row.original.aircraftId
                          ? "grid-rows-[1fr]"
                          : "grid-rows-[0fr]",
                      )}
                    >
                      <div className="overflow-hidden">
                        <FlightStatusDetails nowMs={nowMs} row={row.original} />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell
                className="h-24 text-center text-primary-foreground/70"
                colSpan={columns.length}
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </GlassSurface>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-primary-foreground/15 bg-primary-foreground/10 px-2.5 py-1.5">
      <p className="truncate text-[10px] font-medium uppercase tracking-wide text-primary-foreground/60">
        {label}
      </p>
      <p className="truncate text-sm font-semibold uppercase text-primary-foreground">
        {value}
      </p>
    </div>
  );
}

function FlightStatusDetails({
  nowMs,
  row,
}: {
  nowMs: number;
  row: DashboardFlightStatusRow;
}) {
  const journey = row.journey;
  const scheduledLabel = journey.dofAt
    ? formatTimeOfDay(journey.dofAt)
    : "an unfiled time";

  const statusLine =
    journey.status === "arrived" && journey.terminatedAt
      ? `Arrived at ${formatTimeOfDay(journey.terminatedAt)}`
      : journey.commencedAt
        ? `Departed: ${formatElapsedHm(journey.commencedAt)} ago`
        : isJourneyOverdue(journey.status, journey.dofAt, nowMs)
          ? `Overdue — was due to depart at ${scheduledLabel}`
          : `Will depart at ${scheduledLabel}`;

  return (
    <div
      className={cn(
        "grid grid-cols-2 items-stretch gap-3 bg-primary-foreground/5 p-3 sm:grid-cols-[minmax(0,1fr)_14rem] sm:gap-4 sm:p-4",
        BOARD_STATUS_META[row.boardStatus].rowClassName,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1.5 sm:justify-center sm:gap-2.5">
        <div className="flex items-center gap-2">
          <PlaneIcon className="size-5 shrink-0 fill-primary-foreground/80 text-primary-foreground/80" />
          <p className="truncate text-lg font-bold uppercase tracking-wide text-primary-foreground">
            {journey.departureAerodrome} - {journey.destinationAerodrome}
          </p>
        </div>
        <p className="text-sm text-primary-foreground/75">{statusLine}</p>
        <div className="mt-0.5 w-full rounded-lg border border-primary-foreground/15 bg-primary-foreground/10 px-2.5 py-1 sm:hidden">
          <p className="truncate text-[10px] font-medium uppercase tracking-wide text-primary-foreground/60">
            Type
          </p>
          <p className="truncate text-sm font-semibold uppercase text-primary-foreground">
            {row.typeName}
          </p>
        </div>
        <div className="hidden gap-2 sm:grid sm:grid-cols-4">
          <DetailField label="Type" value={row.typeName} />
          <DetailField label="Speed" value={journey.cruisingSpeed || "—"} />
          <DetailField label="Level" value={journey.cruisingLevel || "—"} />
          <DetailField label="EET" value={journey.totalEet || "—"} />
        </div>
      </div>

      {row.photoUrl ? (
        <div
          aria-label={`${row.registrationMark} aircraft image`}
          className="h-full min-h-24 rounded-lg border border-primary-foreground/15 bg-primary-foreground/10 bg-cover bg-center sm:min-h-28 sm:rounded-xl"
          role="img"
          style={{ backgroundImage: `url(${row.photoUrl})` }}
        />
      ) : (
        <div className="flex h-full min-h-24 items-center justify-center rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 sm:min-h-28 sm:rounded-xl">
          <ImageIcon className="size-8 text-primary-foreground/30" />
        </div>
      )}
    </div>
  );
}
