import type { Metadata } from "next";

import { MonitorPage } from "@/modules/monitor/components/monitor-page";

export const metadata: Metadata = {
  title: "Flight Monitor · FlightraX",
};

export default function Page() {
  return <MonitorPage />;
}
