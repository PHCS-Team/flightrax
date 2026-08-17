import type {
  BALANCE_STATUS_OPTIONS,
  WEIGHT_STATUS_OPTIONS,
} from "@/modules/flight-documents/constants/flight-request-options";
import type { Database } from "@/shared/types/supabase";

export type WeightBalanceRow =
  Database["public"]["Tables"]["weight_balances"]["Row"];
export type WeightBalanceInsert =
  Database["public"]["Tables"]["weight_balances"]["Insert"];
export type WeightBalanceUpdate =
  Database["public"]["Tables"]["weight_balances"]["Update"];

export type WeightBalanceBaggageEntryRow =
  Database["public"]["Tables"]["weight_balance_baggage_entries"]["Row"];
export type WeightBalanceBaggageEntryInsert =
  Database["public"]["Tables"]["weight_balance_baggage_entries"]["Insert"];
export type WeightBalanceBaggageEntryUpdate =
  Database["public"]["Tables"]["weight_balance_baggage_entries"]["Update"];

export type WeightStatus = (typeof WEIGHT_STATUS_OPTIONS)[number]["value"];
export type BalanceStatus = (typeof BALANCE_STATUS_OPTIONS)[number]["value"];

// One weight/arm/moment station line on the W&B sheet.
export type WeightBalanceStation = {
  weight: number | null;
  arm: number | null;
  moment: number | null;
};

export type WeightBalanceBaggageEntry = {
  id: string;
  position: number;
  weight: number;
  arm: number | null;
  moment: number | null;
};
