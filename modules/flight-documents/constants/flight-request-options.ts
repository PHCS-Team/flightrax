// Statuses for the flight request lifecycle. Request statuses mirror the
// check constraint on public.flight_requests; journey statuses mirror the
// public.journey_status enum; weight/balance statuses mirror the checks
// on public.weight_balances — keep each in sync with its migration.

export const FLIGHT_REQUEST_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "pending_approval", label: "Pending Approval" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

export const EDITABLE_FLIGHT_REQUEST_STATUSES = ["draft", "rejected"] as const;

export const FLIGHT_REQUEST_STATUS_GROUPS = {
  in_progress: ["draft", "rejected"],
  pending_approval: ["pending_approval"],
  approved: ["approved"],
} as const;

export const JOURNEY_STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "active", label: "Active" },
  { value: "arrived", label: "Arrived" },
  { value: "standby", label: "Standby" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export const WEIGHT_STATUS_OPTIONS = [
  { value: "within_limits", label: "Within Limits" },
  { value: "overweight", label: "Overweight" },
] as const;

export const BALANCE_STATUS_OPTIONS = [
  { value: "balanced", label: "Balanced" },
  { value: "nose_heavy", label: "Nose Heavy" },
  { value: "tail_heavy", label: "Tail Heavy" },
] as const;
