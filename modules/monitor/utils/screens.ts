import type {
  MonitorFlightRow,
  MonitorScreen,
  MonitorSection,
} from "@/modules/monitor/types/monitor";
import type { BoardStatus } from "@/shared/lib/aviation/board-status-styles";

export const MONITOR_ROWS_PER_PAGE = 7;

export const MONITOR_SCREEN_MS = 20 * 1000;

export const MONITOR_NOTAM_MS = 10 * 1000;

// Each section maps onto the dashboard board status so the rows and
// pills use the exact same colours as the dashboard.
export const MONITOR_SECTIONS: ReadonlyArray<{
  id: MonitorSection;
  title: string;
  emptyMessage: string;
  boardStatus: BoardStatus;
}> = [
  {
    id: "on_ground",
    title: "On Ground",
    emptyMessage: "No flights on ground",
    boardStatus: "on_ground",
  },
  {
    id: "departed",
    title: "Departed",
    emptyMessage: "No flights in progress",
    boardStatus: "active",
  },
  {
    id: "arrived",
    title: "Arrived",
    emptyMessage: "No completed flights today",
    boardStatus: "arrived",
  },
];

// One screen per section, or several when a section has more rows than
// fit on the TV. Every section always gets at least one screen so the
// rotation stays 1/3, 2/3, 3/3 even when empty.
export function buildMonitorScreens(
  rows: MonitorFlightRow[],
  rowsPerPage = MONITOR_ROWS_PER_PAGE,
): MonitorScreen[] {
  return MONITOR_SECTIONS.flatMap((section) => {
    const sectionRows = rows.filter((row) => row.section === section.id);
    const pageCount = Math.max(1, Math.ceil(sectionRows.length / rowsPerPage));

    return Array.from({ length: pageCount }, (_, index) => ({
      section: section.id,
      page: index + 1,
      pageCount,
      rows: sectionRows.slice(index * rowsPerPage, (index + 1) * rowsPerPage),
    }));
  });
}
