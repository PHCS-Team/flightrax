"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table";
import { ImageIcon, PlaneIcon } from "lucide-react";
import { Fragment, useEffect, useState } from "react";

import type {
  DashboardBoardStatus,
  DashboardFlightStatusRow,
} from "@/modules/dashboard/types/flight-status";
import {
  formatElapsedHm,
  formatShortPersonName,
  formatTimeOfDay,
  formatZuluTimeToLocal,
} from "@/modules/dashboard/utils/format";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/utils";

// Pills follow the FLIGHT_REQUEST_STATUS_PILLS recipe; each row also
// carries a subtle status wash — slightly darker on the left, fading
// to clear.
const BOARD_STATUS_META: Record<
  DashboardBoardStatus,
  { label: string; className: string; rowClassName: string }
> = {
  active: {
    label: "Active",
    className: "border-emerald-200/50 bg-emerald-600/80 text-white",
    rowClassName:
      "bg-linear-to-r from-emerald-700/60 via-emerald-600/20 to-transparent",
  },
  scheduled: {
    label: "Scheduled",
    className: "border-orange-200/50 bg-orange-500/80 text-white",
    rowClassName:
      "bg-linear-to-r from-orange-700/60 via-orange-600/20 to-transparent",
  },
  arrived: {
    label: "Arrived",
    className: "border-yellow-200/60 bg-yellow-500/80 text-white",
    rowClassName:
      "bg-linear-to-r from-yellow-600/50 via-yellow-500/15 to-transparent",
  },
  standby: {
    label: "Standby",
    className:
      "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground/60",
    rowClassName: "",
  },
  on_ground: {
    label: "On Ground",
    className: "border-red-200/40 bg-red-700/70 text-red-50",
    rowClassName:
      "bg-linear-to-r from-red-700/60 via-red-600/20 to-transparent",
  },
};

export function FlightStatusBoard({
  page,
  pageSize,
  rows,
  totalPages,
}: {
  page: number;
  pageSize: number;
  rows: DashboardFlightStatusRow[];
  totalPages: number;
}) {
  const [expandedAircraftId, setExpandedAircraftId] = useState<string | null>(
    null,
  );

  // Warm the browser cache for row photos so an opened accordion shows
  // its image immediately instead of popping in after load.
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
      accessorKey: "aircraftIdentification",
      header: "Aircraft",
      cell: ({ row }) => (
        <div className="flex min-w-0 items-center gap-2">
          <span className="hidden size-8 shrink-0 items-center justify-center rounded-md border border-primary-foreground/15 bg-primary-foreground/10 sm:flex">
            <PlaneIcon className="size-4 fill-primary-foreground/70 text-primary-foreground/70" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-primary-foreground">
              {row.original.aircraftIdentification}
            </p>
            <p className="truncate text-[11px] text-primary-foreground/60">
              {row.original.model}
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

        return (
          <span
            className={cn(
              "inline-flex items-center whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[10px] font-semibold sm:px-2.5 sm:text-xs",
              meta.className,
            )}
          >
            {meta.label}
          </span>
        );
      },
    },
    {
      id: "trainee",
      header: "Trainee",
      cell: ({ row }) => (
        <p className="truncate text-sm text-primary-foreground/90">
          {row.original.journey
            ? formatShortPersonName(row.original.journey.traineeName)
            : "—"}
        </p>
      ),
    },
    {
      id: "instructor",
      header: "Instructor",
      cell: ({ row }) => (
        <p className="truncate text-sm text-primary-foreground/90">
          {row.original.journey
            ? formatShortPersonName(row.original.journey.pilotInCommandName)
            : "—"}
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
    state: { pagination },
  });

  return (
    <GlassSurface className="overflow-hidden">
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
                    "cursor-pointer border-primary-foreground/10 hover:bg-primary-foreground/10",
                    BOARD_STATUS_META[row.original.boardStatus].rowClassName,
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
                      ? "border-primary-foreground/10"
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
                        <FlightStatusDetails row={row.original} />
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
                No flights or maintenance to monitor today.
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
      <p className="truncate text-sm font-semibold text-primary-foreground">
        {value}
      </p>
    </div>
  );
}

function FlightStatusDetails({ row }: { row: DashboardFlightStatusRow }) {
  const journey = row.journey;

  const statusLine = journey
    ? journey.status === "arrived" && journey.terminatedAt
      ? `Arrived at ${formatTimeOfDay(journey.terminatedAt)}`
      : journey.commencedAt
        ? `Departed: ${formatElapsedHm(journey.commencedAt)} ago`
        : `Will depart at ${formatZuluTimeToLocal(journey.departureTimeRaw)}`
    : row.boardStatus === "on_ground"
      ? row.aircraftStatus === "maintenance"
        ? "Under maintenance."
        : "Grounded."
      : "Available for scheduling.";

  return (
    <div
      className={cn(
        "grid grid-cols-2 items-stretch gap-3 bg-primary-foreground/5 p-3 sm:grid-cols-[minmax(0,1fr)_14rem] sm:gap-4 sm:p-4",
        BOARD_STATUS_META[row.boardStatus].rowClassName,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1.5 sm:justify-center sm:gap-2.5">
        <div className="flex items-center gap-2">
          <PlaneIcon
            className={cn(
              "size-5 shrink-0",
              journey
                ? "fill-primary-foreground/80 text-primary-foreground/80"
                : "fill-primary-foreground/35 text-primary-foreground/35",
            )}
          />
          <p
            className={cn(
              "truncate text-lg font-bold tracking-wide",
              journey
                ? "text-primary-foreground"
                : "text-primary-foreground/60",
            )}
          >
            {journey
              ? `${journey.departureAerodrome} - ${journey.destinationAerodrome}`
              : "No Flight Today"}
          </p>
        </div>
        <p className="text-sm text-primary-foreground/75">{statusLine}</p>
        <div className="mt-0.5 w-full rounded-lg border border-primary-foreground/15 bg-primary-foreground/10 px-2.5 py-1 sm:hidden">
          <p className="truncate text-[10px] font-medium uppercase tracking-wide text-primary-foreground/60">
            Type
          </p>
          <p className="truncate text-sm font-semibold text-primary-foreground">
            {row.typeName}
          </p>
        </div>
        <div className="hidden gap-2 sm:grid sm:grid-cols-4">
          <DetailField label="Type" value={row.typeName} />
          <DetailField label="Speed" value={journey?.cruisingSpeed || "—"} />
          <DetailField label="Level" value={journey?.cruisingLevel || "—"} />
          <DetailField label="EET" value={journey?.totalEet || "—"} />
        </div>
      </div>

      {row.photoUrl ? (
        <div
          aria-label={`${row.aircraftIdentification} aircraft image`}
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
