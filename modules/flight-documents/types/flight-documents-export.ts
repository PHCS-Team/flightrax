import type { FlightPlanFormValues } from "@/modules/flight-documents/schemas/flight-plan-schema";
import type { FlightRequestStatus } from "@/modules/flight-documents/types/flight-request";
import type {
  BalanceStatus,
  WeightStatus,
} from "@/modules/flight-documents/types/weight-balance";

// Everything the PDF builders need for one flight, fetched once when the
// user asks to download. Signatures are the raw signature_pad SVG markup
// snapshotted on the records at filing / approval time.
import type { LicenseShortForm } from "@/modules/flight-documents/types/license-short-form";

// Short forms are resolved on the server against the current rating options.
export type ExportLicense = LicenseShortForm;

export type FlightPlanExport = {
  planCode: string;
  requestStatus: FlightRequestStatus;
  aircraftIdentification: string;
  aircraftTypeName: string;
  /** ICAO Doc 8643 designator printed in Item 9. */
  aircraftTypeDesignator: string;
  aircraftColorMarkings: string;
  filedByName: string;
  pilotSignatureSvg: string | null;
  pilotLicenses: ExportLicense[];
  representativeName: string | null;
  representativeSignatureSvg: string | null;
  representativeLicenses: ExportLicense[];
  values: FlightPlanFormValues;
};

export type WeightBalanceExportBaggage = {
  position: number;
  weight: number;
  arm: number | null;
  moment: number | null;
};

// The weight_balances row is a full snapshot of the sheet (givens
// included), so the PDF prints it as stored rather than recomputing.
export type WeightBalanceExport = {
  registrationMark: string;
  aircraftTypeName: string;
  /** ISO timestamp the sheet is dated with (date of flight, else prepared). */
  date: string;
  basicEmptyWeight: number;
  basicEmptyWeightArm: number;
  basicEmptyWeightMoment: number;
  usableFuelWeight: number | null;
  usableFuelArm: number | null;
  usableFuelMoment: number | null;
  fiAndStudentWeight: number | null;
  fiAndStudentArm: number | null;
  fiAndStudentMoment: number | null;
  baggage: WeightBalanceExportBaggage[];
  totalWeight: number | null;
  totalMoment: number | null;
  totalCg: number | null;
  maximumTakeoffWeight: number | null;
  maxBaggageWeight: number | null;
  weightStatus: WeightStatus | null;
  balanceStatus: BalanceStatus | null;
  preparedByName: string | null;
  preparedBySignatureSvg: string | null;
  verifiedByName: string | null;
  verifiedBySignatureSvg: string | null;
};

export type FlightDocumentsExport = {
  flightPlan: FlightPlanExport;
  weightBalance: WeightBalanceExport | null;
};

export type FlightDocumentKind = "flight-plan" | "weight-balance" | "both";
