"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment } from "react";

import { BOARD_STATUS_META } from "@/modules/dashboard/components/flight-status-board";
import {
  DelayedTab,
  PastEetTab,
} from "@/modules/dashboard/components/board-alert-tab";
import { useNowMs } from "@/modules/dashboard/hooks/use-now";
import type { DashboardFlightStatusRow } from "@/modules/dashboard/types/flight-status";
import {
  isJourneyOverdue,
  isJourneyPastEet,
} from "@/modules/dashboard/utils/board-status";
import {
  formatShortPersonName,
  formatSpanHm,
  formatZuluHm,
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

const HEADER_CLASS = "bg-primary font-semibold text-primary-foreground";

const PAGER_BUTTON_CLASS =
  "inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground transition hover:bg-primary-foreground/15 disabled:cursor-default disabled:opacity-50 sm:size-7";

const TIME_PILL_CLASS =
  "inline-flex min-w-14 items-center justify-center rounded-full border px-2 py-0.5 font-mono text-xs font-semibold tabular-nums sm:text-sm";


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
  canViewFlightLog,
  groups,
}: {
  canViewFlightLog: boolean;
  groups: OrganizedBoardGroup[];
}) {
  const nowMs = useNowMs();

  return (
    <GlassSurface className="overflow-hidden">
      <Table className="table-fixed text-primary-foreground">
        <TableHeader>
          <TableRow className="border-primary-foreground/20 hover:bg-primary">
            <TableHead
              className={cn(HEADER_CLASS, "w-[32%] pl-4 sm:w-[30%] sm:pl-6")}
            >
              Aircraft
            </TableHead>
            <TableHead className={cn(HEADER_CLASS, "w-[20%] text-center")}>
              Time (Z)
            </TableHead>
            <TableHead className={cn(HEADER_CLASS, "text-center")}>
              Student
            </TableHead>
            <TableHead className={cn(HEADER_CLASS, "pr-4 text-center sm:pr-6")}>
              Instructor
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
                    <OrganizedBoardRow
                      canViewFlightLog={canViewFlightLog}
                      key={row.journey.id}
                      nowMs={nowMs}
                      row={row}
                    />
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

function getRowTime(row: DashboardFlightStatusRow): string | null {
  const journey = row.journey;
  const iso =
    row.boardStatus === "on_ground"
      ? journey.dofAt
      : row.boardStatus === "active"
        ? journey.commencedAt
        : journey.terminatedAt;

  return iso ? formatZuluHm(iso) : null;
}

function getAirborne(
  row: DashboardFlightStatusRow,
  nowMs: number,
): string | null {
  const journey = row.journey;

  if (row.boardStatus !== "active" || !journey.commencedAt || nowMs === 0) {
    return null;
  }

  return formatSpanHm(journey.commencedAt, nowMs);
}

function OrganizedBoardRow({
  canViewFlightLog,
  nowMs,
  row,
}: {
  canViewFlightLog: boolean;
  nowMs: number;
  row: DashboardFlightStatusRow;
}) {
  const router = useRouter();
  const journey = row.journey;
  const meta = BOARD_STATUS_META[row.boardStatus];
  const overdue = isJourneyOverdue(journey.status, journey.dofAt, nowMs);
  const pastEet = isJourneyPastEet(journey, nowMs);
  const time = getRowTime(row);
  const airborne = getAirborne(row, nowMs);
  const isLocal =
    journey.departureAerodrome.toUpperCase() ===
    journey.destinationAerodrome.toUpperCase();
  const duration =
    journey.commencedAt && journey.terminatedAt
      ? formatSpanHm(journey.commencedAt, journey.terminatedAt)
      : null;

  return (
    <TableRow
      className={cn(
        "hover:bg-primary-foreground/10",
        meta.rowClassName,
        meta.borderClassName,
      )}
    >
      <TableCell className="w-[32%] whitespace-normal pl-4 text-primary-foreground sm:w-[30%] sm:pl-6">
        <div className="min-w-0">
          <p className="font-semibold uppercase">{row.registrationMark}</p>
          {row.boardStatus === "on_ground" && (
            <p className="text-[11px] font-semibold tracking-wide text-primary-foreground/70">
              {isLocal ? "LOCAL" : "CROSS"}
            </p>
          )}
          {row.boardStatus === "active" && (
            <p className="font-mono text-[11px] tabular-nums text-primary-foreground/70">
              Airborne {airborne ?? "—"}
            </p>
          )}
          {row.boardStatus === "arrived" &&
            (canViewFlightLog ? (
              <button
                className="flex max-w-full cursor-pointer items-center gap-1 text-left text-[11px] font-medium text-primary-foreground/80 underline-offset-2 hover:text-primary-foreground hover:underline"
                onClick={() =>
                  router.push(`/flight-plans/${journey.flightPlanId}`)
                }
                type="button"
              >
                <FileTextIcon className="size-3 shrink-0" />
                <span>View flight log</span>
              </button>
            ) : (
              <p className="font-mono text-[11px] tabular-nums text-primary-foreground/70">
                Flight time {duration ?? "—"}
              </p>
            ))}
        </div>
      </TableCell>
      <TableCell className="w-[20%] text-center">
        {time ? (
          <span className={cn(TIME_PILL_CLASS, meta.className)}>{time}</span>
        ) : (
          <span className="text-sm text-primary-foreground/60">—</span>
        )}
      </TableCell>
      <TableCell className="truncate text-center text-sm uppercase text-primary-foreground/90">
        {formatShortPersonName(journey.traineeName)}
      </TableCell>
      <TableCell className="relative truncate pr-4 text-center text-sm uppercase text-primary-foreground/90 sm:pr-6">
        {formatShortPersonName(journey.instructorName)}
        {overdue && <DelayedTab />}
        {pastEet && <PastEetTab />}
      </TableCell>
    </TableRow>
  );
}
