// The `severity` column is `text` with a check constraint; these are the
// values it allows. NOTAM_SEVERITIES in shared/lib/aviation/notam-options
// is the runtime list for schemas, filters, and pills.
export type NotamSeverity = "advisory" | "warning" | "alert";

export type NotamSummary = {
  id: string;
  title: string;
  description: string | null;
  severity: NotamSeverity;
  expiresAt: string;
  createdAt: string;
};
