"use client";

import { MonitorNotamBand } from "@/modules/monitor/components/monitor-notam-band";
import { useMonitorClockMs } from "@/modules/monitor/hooks/use-monitor-clock";
import { useMonitorTimeZone } from "@/modules/monitor/hooks/use-monitor-time-zone";
import { useScreenRotation } from "@/modules/monitor/hooks/use-screen-rotation";
import type {
  MonitorBoard as MonitorBoardData,
  MonitorFlightRow,
} from "@/modules/monitor/types/monitor";
import {
  MONITOR_NOTAM_MS,
  MONITOR_ROWS_PER_PAGE,
  MONITOR_SCREEN_MS,
  MONITOR_SECTIONS,
  buildMonitorScreens,
} from "@/modules/monitor/utils/screens";
import {
  MONITOR_TIME_ZONE_META,
  formatMonitorDate,
  formatMonitorTime,
  type MonitorTimeZone,
} from "@/modules/monitor/utils/time-zone";
import { FlightRaxBackground } from "@/shared/components/layout/flightrax-background";
import { BOARD_STATUS_STYLES } from "@/shared/lib/aviation/board-status-styles";
import {
  formatShortPersonName,
  isJourneyOverdue,
  isJourneyPastEet,
} from "@/shared/lib/aviation/flight-board";
import { cn } from "@/shared/lib/utils";

const GRID_COLUMNS = "grid-cols-[13vw_17vw_minmax(0,1fr)_20vw_20vw]";

function getRowTime(row: MonitorFlightRow, zone: MonitorTimeZone): string {
  const iso =
    row.section === "on_ground"
      ? row.dofAt
      : row.section === "departed"
        ? row.commencedAt
        : row.terminatedAt;

  return iso ? formatMonitorTime(iso, zone) : "—";
}

function getRowAlert(row: MonitorFlightRow, nowMs: number): string | null {
  if (isJourneyOverdue(row.journeyStatus, row.dofAt, nowMs)) {
    return "Delayed";
  }

  if (
    isJourneyPastEet(
      {
        status: row.journeyStatus,
        commencedAt: row.commencedAt,
        totalEet: row.totalEet,
      },
      nowMs,
    )
  ) {
    return "Past EET";
  }

  return null;
}

export function MonitorBoard({ board }: { board: MonitorBoardData }) {
  const nowMs = useMonitorClockMs();
  const zone = useMonitorTimeZone();
  const screens = buildMonitorScreens(board.rows);
  const screenIndex = useScreenRotation(screens.length, MONITOR_SCREEN_MS);
  const notamIndex = useScreenRotation(board.notams.length, MONITOR_NOTAM_MS);
  const screen = screens[screenIndex];
  const sectionIndex = MONITOR_SECTIONS.findIndex(
    (section) => section.id === screen.section,
  );
  const section = MONITOR_SECTIONS[sectionIndex];
  const status = BOARD_STATUS_STYLES[section.boardStatus];
  const nowIso = nowMs ? new Date(nowMs).toISOString() : null;

  return (
    <FlightRaxBackground
      className="h-dvh w-screen cursor-none overflow-hidden"
      contentClassName="grid h-full grid-rows-[auto_minmax(0,1fr)_auto]"
    >
      <header className="flex items-center justify-between gap-[3vw] bg-primary-foreground px-[3vw] py-[1vh] text-primary">
        <div
          className="flex items-baseline gap-[1.5vw] animate-in fade-in duration-1000"
          key={screenIndex}
        >
          <h1 className="text-[min(2.6vw,4.4vh)] font-semibold uppercase leading-none tracking-[0.3em]">
            {section.title}
          </h1>
          <p className="font-mono text-[min(2vw,3.4vh)] leading-none tabular-nums text-primary/80">
            {sectionIndex + 1}/{MONITOR_SECTIONS.length}
          </p>
          {screen.pageCount > 1 && (
            <span
              aria-label={`Page ${screen.page} of ${screen.pageCount}`}
              className="flex items-center gap-[0.4vw] self-center"
              role="img"
            >
              {Array.from({ length: screen.pageCount }, (_, index) => (
                <span
                  className={cn(
                    "size-[min(0.6vw,1vh)] rounded-full transition-colors duration-700",
                    index + 1 === screen.page
                      ? "bg-primary/70"
                      : "bg-primary/20",
                  )}
                  key={index}
                />
              ))}
            </span>
          )}
        </div>
        <div className="text-right leading-tight">
          <p className="text-[min(1.3vw,2.2vh)] font-medium">
            {nowIso ? formatMonitorDate(nowIso, zone) : " "}
          </p>
          <p className="flex items-baseline justify-end gap-[0.6vw] font-mono text-[min(1.7vw,2.9vh)] tabular-nums">
            {nowIso ? formatMonitorTime(nowIso, zone) : " "}
            <span className="font-sans text-[min(0.9vw,1.5vh)] font-semibold tracking-[0.2em] text-primary/45">
              {MONITOR_TIME_ZONE_META[zone].indicator}
            </span>
          </p>
        </div>
      </header>

      <main className="flex min-h-0 flex-col">
        <div
          className={cn(
            "grid items-center border-b border-primary-foreground/20 bg-primary px-[3vw] py-[1vh] text-[min(1.4vw,2.4vh)] font-semibold text-primary-foreground",
            GRID_COLUMNS,
          )}
        >
          <p>Time</p>
          <p>Registry</p>
          <p>To</p>
          <p>Student</p>
          <p>Instructor</p>
        </div>

        <div
          className="flex min-h-0 flex-1 flex-col animate-in fade-in slide-in-from-right-4 duration-1000 ease-out"
          key={screenIndex}
        >
          {screen.rows.length === 0 ? (
            <p className="flex flex-1 items-center justify-center text-[min(2vw,3.4vh)] text-primary-foreground/70">
              {section.emptyMessage}
            </p>
          ) : (
            <ul
              className="grid min-h-0 flex-1"
              style={{
                gridTemplateRows: `repeat(${MONITOR_ROWS_PER_PAGE}, minmax(0, 1fr))`,
              }}
            >
              {screen.rows.map((row) => {
                const alert = getRowAlert(row, nowMs);

                return (
                  <li
                    className={cn(
                      "grid min-h-0 items-center border-b px-[3vw] text-[min(2.1vw,3.6vh)] leading-snug",
                      GRID_COLUMNS,
                      status.rowClassName,
                      status.borderClassName,
                    )}
                    key={row.aircraftId}
                  >
                    <div
                      className={cn(
                        "font-mono tabular-nums",
                        alert && "text-red-300",
                      )}
                    >
                      <p>{getRowTime(row, zone)}</p>
                      {alert && (
                        <p className="mt-[0.5vh] font-sans text-[min(1vw,1.7vh)] font-semibold uppercase tracking-wider">
                          {alert}
                        </p>
                      )}
                    </div>
                    <p className="truncate font-semibold uppercase">
                      {row.registrationMark}
                    </p>
                    <p className="truncate pr-[2vw]">{row.destination}</p>
                    <p className="truncate">
                      {formatShortPersonName(row.traineeName)}
                    </p>
                    <p className="truncate">
                      {formatShortPersonName(row.instructorName)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>

      <MonitorNotamBand activeIndex={notamIndex} notams={board.notams} />
    </FlightRaxBackground>
  );
}
