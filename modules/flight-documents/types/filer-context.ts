import type { ExpiredCredential } from "@/shared/types/credentials";
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
  // The registered signature itself, so the draft preview can render the
  // form exactly as it will print once saved.
  signatureSvg: string | null;
  // True when the filer holds at least one active, non-expired license —
  // required to file a flight plan.
  hasValidLicense: boolean;
  // True when the filer holds any active, non-expired license — enough to
  // be named PIC (SPL included), not enough to approve.
  canSetSelfAsPic: boolean;
  // True when the filer may approve a request they are PIC on: instructor
  // with any valid license, or student with a valid PPL.
  canApproveAsPic: boolean;
  // Licenses and certificates on the filer's account that have lapsed —
  // any one of them blocks filing.
  expiredCredentials: ExpiredCredential[];
};

export type PicUnavailability = {
  startsOn: string;
  endsOn: string;
};

// Approved flight instructor selectable as pilot in command.
export type FlightPlanPicOption = {
  id: string;
  fullName: string;
  unavailabilities: PicUnavailability[];
  expiredCredentials: ExpiredCredential[];
};
