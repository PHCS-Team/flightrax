"use client";

import { RadarIcon } from "lucide-react";

import { MonitorBoard } from "@/modules/monitor/components/monitor-board";
import { useMonitorBoard } from "@/modules/monitor/hooks/use-monitor-board.query";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";

export function MonitorClientSurface() {
  const { board, error, isPending } = useMonitorBoard();

  if (isPending) {
    return <LoadingScreen />;
  }

  if (!board) {
    return (
      <EmptyState
        description={error?.message ?? "The flight monitor returned no data."}
        icon={<RadarIcon className="size-7" />}
        title="Flight Monitor Could Not Be Loaded"
      />
    );
  }

  return <MonitorBoard board={board} />;
}
