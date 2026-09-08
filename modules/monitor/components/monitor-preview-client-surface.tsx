"use client";

import { useState } from "react";

import { MonitorBoard } from "@/modules/monitor/components/monitor-board";
import { buildMonitorPreviewBoard } from "@/modules/monitor/utils/preview-fixture";

export function MonitorPreviewClientSurface() {
  const [board] = useState(() => buildMonitorPreviewBoard());

  return <MonitorBoard board={board} />;
}
