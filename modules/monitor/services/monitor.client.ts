import type { MonitorBoard } from "@/modules/monitor/types/monitor";
import { getApiErrorMessage } from "@/shared/lib/api-error";

export async function fetchFlightMonitorBoard() {
  const response = await fetch("/api/monitor", { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load the flight monitor."),
    );
  }

  return (await response.json()) as MonitorBoard;
}
