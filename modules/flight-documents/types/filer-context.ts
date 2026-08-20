import type { Database } from "@/shared/types/supabase";

// License row shape used for the Other Information auto-fill and the
// self-as-PIC eligibility check.
export type FlightPlanFilerLicense = {
  licenseType: string;
  licenseNumber: string;
  ratings: string[];
  expiryDate: string | null;
  hasNoExpiry: boolean;
  status: Database["public"]["Enums"]["license_status"];
};

export type FlightPlanFilerContext = {
  profile: {
    id: string;
    fullName: string;
    role: Database["public"]["Enums"]["app_role"];
  };
  licenses: FlightPlanFilerLicense[];
  // True when the filer has a registered signature — required to file,
  // because saving auto-signs the plan with it.
  hasSignature: boolean;
  // True when the filer holds at least one active, non-expired license —
  // required to file a flight plan.
  hasValidLicense: boolean;
  // True when the filer holds an active, non-expired PPL license.
  canSetSelfAsPic: boolean;
};

// Approved flight instructor selectable as pilot in command.
export type FlightPlanPicOption = {
  id: string;
  fullName: string;
};
