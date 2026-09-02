"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  type LucideIcon,
} from "lucide-react";
import { Fragment } from "react";

import { BOARD_STATUS_META } from "@/modules/dashboard/components/flight-status-board";
import type { DashboardFlightStatusRow } from "@/modules/dashboard/types/flight-status";
import {
  formatDurationBetween,
  formatShortPersonName,
  formatTimeOfDay,
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

const COLUMN_COUNT = 4;

const PAGER_BUTTON_CLASS =
  "inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground transition hover:bg-primary-foreground/15 disabled:cursor-default disabled:opacity-50 sm:size-7";

export type OrganizedBoardGroup = {
  id: string;
  title: string;
  icon: LucideIcon;
  emptyMessage: string;
  rows: DashboardFlightStatusRow[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function OrganizedFlightStatusBoard({
  groups,
}: {
  groups: OrganizedBoardGroup[];
}) {
  return (
    <GlassSurface className="overflow-hidden">
      <Table className="table-fixed text-primary-foreground">
        <TableHeader>
          <TableRow className="border-primary-foreground/20 hover:bg-primary">
            <TableHead className="w-[34%] bg-primary pl-4 font-semibold text-primary-foreground sm:pl-6">
              Aircraft
            </TableHead>
            <TableHead className="bg-primary text-center font-semibold text-primary-foreground">
              Departed
            </TableHead>
            <TableHead className="bg-primary text-center font-semibold text-primary-foreground">
              Arrived
            </TableHead>
            <TableHead className="bg-primary pr-4 text-center font-semibold text-primary-foreground sm:pr-6">
              Duration
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => {
            const GroupIcon = group.icon;

            return (
              <Fragment key={group.id}>
                <TableRow className="border-primary-foreground/15 hover:bg-transparent">
                  <TableCell className="p-0" colSpan={COLUMN_COUNT}>
                    <div className="flex items-center justify-between gap-3 bg-primary-foreground/10 py-1.5 pl-4 pr-3 backdrop-blur sm:pl-6 sm:pr-4">
                      <p className="flex min-w-0 items-center gap-2 text-sm font-semibold tracking-tight text-primary-foreground">
                        <GroupIcon className="size-4 shrink-0 text-primary-foreground/70" />
                        <span className="truncate">{group.title}</span>
                      </p>
                      {group.totalPages > 1 && (
                        <div className="flex items-center gap-1">
                          <button
                            aria-label={`Previous ${group.title} page`}
                            className={PAGER_BUTTON_CLASS}
                            disabled={group.page <= 1}
                            onClick={() => group.onPageChange(group.page - 1)}
                            type="button"
                          >
                            <ChevronLeftIcon className="size-3.5" />
                          </button>
                          <button
                            aria-label={`Next ${group.title} page`}
                            className={PAGER_BUTTON_CLASS}
                            disabled={group.page >= group.totalPages}
                            onClick={() => group.onPageChange(group.page + 1)}
                            type="button"
                          >
                            <ChevronRightIcon className="size-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>

                {group.rows.length === 0 ? (
                  <TableRow className="border-primary-foreground/10 hover:bg-transparent">
                    <TableCell
                      className="py-4 text-center text-sm text-primary-foreground/60"
                      colSpan={COLUMN_COUNT}
                    >
                      {group.emptyMessage}
                    </TableCell>
                  </TableRow>
                ) : (
                  group.rows.map((row) => (
                    <OrganizedBoardRow key={row.aircraftId} row={row} />
                  ))
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </GlassSurface>
  );
}

function OrganizedBoardRow({ row }: { row: DashboardFlightStatusRow }) {
  const journey = row.journey;
  const subtitle = journey
    ? `${formatShortPersonName(journey.traineeName)} · ${formatShortPersonName(journey.pilotInCommandName)}`
    : row.aircraftStatus === "maintenance"
      ? "Under maintenance"
      : "Grounded";
  const departedAt = journey?.commencedAt
    ? formatTimeOfDay(journey.commencedAt)
    : "—";
  const arrivedAt = journey?.terminatedAt
    ? formatTimeOfDay(journey.terminatedAt)
    : "—";
  const duration =
    formatDurationBetween(
      journey?.commencedAt ?? null,
      journey?.terminatedAt ?? null,
    ) ?? "—";

  return (
    <TableRow
      className={cn(
        "border-primary-foreground/10 hover:bg-primary-foreground/10",
        BOARD_STATUS_META[row.boardStatus].rowClassName,
      )}
    >
      <TableCell className="pl-4 text-primary-foreground sm:pl-6">
        <div className="min-w-0">
          <p className="truncate font-semibold">{row.aircraftIdentification}</p>
          <p className="truncate text-[11px] text-primary-foreground/60">
            {subtitle}
          </p>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap text-center text-sm text-primary-foreground/90">
        {departedAt}
      </TableCell>
      <TableCell className="whitespace-nowrap text-center text-sm text-primary-foreground/90">
        {arrivedAt}
      </TableCell>
      <TableCell className="whitespace-nowrap pr-4 text-center text-sm text-primary-foreground/90 sm:pr-6">
        {duration}
      </TableCell>
    </TableRow>
  );
}
