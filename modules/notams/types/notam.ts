import type {
  NOTAM_SEVERITY_FILTERS,
  NOTAM_STATUS_FILTERS,
} from "@/modules/notams/constants/notam-options";
import type { NotamSummary } from "@/shared/types/notam";

export type NotamSeverityFilter = (typeof NOTAM_SEVERITY_FILTERS)[number];

export type NotamStatusFilter = (typeof NOTAM_STATUS_FILTERS)[number];

export type Notam = NotamSummary & {
  createdBy: string | null;
  postedBy: string | null;
};
