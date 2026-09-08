import "server-only";

import type {
  MonitorBoard,
  MonitorJourneyStatus,
  MonitorSection,
} from "@/modules/monitor/types/monitor";
import { formatDestination } from "@/modules/monitor/utils/destination";
import { formatIntervalHm } from "@/shared/lib/aviation/flight-board";
import { toNotamSeverity } from "@/shared/lib/aviation/notam-options";
import { createAdminClient } from "@/shared/lib/supabase/admin";

function toSection(status: MonitorJourneyStatus): MonitorSection {
  if (status === "active") {
    return "departed";
  }

  if (status === "scheduled") {
    return "on_ground";
  }

  return "arrived";
}

// Public, unauthenticated read for the lobby TV: display fields only, no
// ids that lead anywhere, served through the admin client because the
// anonymous role has no read policies on these tables.
export async function getFlightMonitorBoard(): Promise<MonitorBoard> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const [boardResult, notamResult] = await Promise.all([
    supabase.rpc("get_flight_monitor_board"),
    supabase
      .from("notams")
      .select("id, title, description, severity")
      .or(`expires_at.is.null,expires_at.gte.${now}`)
      .order("created_at", { ascending: false }),
  ]);

  if (boardResult.error) {
    throw new Error(boardResult.error.message);
  }

  if (notamResult.error) {
    throw new Error(notamResult.error.message);
  }

  return {
    rows: (boardResult.data ?? []).map((row) => ({
      aircraftId: row.aircraft_id,
      registrationMark: row.registration_mark,
      section: toSection(row.journey_status),
      journeyStatus: row.journey_status,
      dofAt: row.dof_at,
      commencedAt: row.commenced_at,
      terminatedAt: row.terminated_at,
      destination: formatDestination(
        row.destination_text,
        row.destination_aerodrome ?? "",
      ),
      totalEet: row.total_eet ? formatIntervalHm(row.total_eet) : "",
      traineeName: row.trainee_name ?? "",
      instructorName: row.instructor_name ?? "",
    })),
    notams: (notamResult.data ?? []).map((notam) => ({
      id: notam.id,
      title: notam.title,
      description: notam.description,
      severity: toNotamSeverity(notam.severity),
    })),
    generatedAt: now,
  };
}
