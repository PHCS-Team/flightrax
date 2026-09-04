import { NOTAM_SEVERITIES } from "@/shared/lib/aviation/notam-options";

export const NOTAM_SEVERITY_FILTERS = ["all", ...NOTAM_SEVERITIES] as const;

export const NOTAM_STATUS_FILTERS = ["active", "expired"] as const;

export const NOTAMS_PAGE_SIZE = 12;
