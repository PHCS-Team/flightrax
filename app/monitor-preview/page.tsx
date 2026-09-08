import type { Metadata } from "next";

import { MonitorPreviewPage } from "@/modules/monitor/components/monitor-preview-page";

export const metadata: Metadata = {
  title: "Flight Monitor Preview · FlightraX",
};

export default function Page() {
  return <MonitorPreviewPage />;
}
