import type { NotamSeverity } from "@/shared/types/notam";
import type { Database } from "@/shared/types/supabase";

export type MonitorRpcRow =
  Database["public"]["Functions"]["get_flight_monitor_board"]["Returns"][number];

export type MonitorJourneyStatus = Database["public"]["Enums"]["journey_status"];

export type MonitorSection = "on_ground" | "departed" | "arrived";

export type MonitorFlightRow = {
  aircraftId: string;
  registrationMark: string;
  section: MonitorSection;
  journeyStatus: MonitorJourneyStatus;
  dofAt: string | null;
  commencedAt: string | null;
  terminatedAt: string | null;
  destination: string;
  totalEet: string;
  traineeName: string;
  instructorName: string;
};

export type MonitorNotam = {
  id: string;
  title: string;
  description: string | null;
  severity: NotamSeverity;
};

export type MonitorBoard = {
  rows: MonitorFlightRow[];
  notams: MonitorNotam[];
  generatedAt: string;
};

export type MonitorScreen = {
  section: MonitorSection;
  page: number;
  pageCount: number;
  rows: MonitorFlightRow[];
};
