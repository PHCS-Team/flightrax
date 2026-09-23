import { PDFDocument } from "pdf-lib";

import type {
  FlightDocumentKind,
  FlightDocumentsExport,
  FlightPlanExport,
  WeightBalanceExport,
} from "@/modules/flight-documents/types/flight-documents-export";
import {
  buildFlightPlanPdf,
  CAAP_FLIGHT_PLAN_FORM_URL,
} from "@/modules/flight-documents/utils/pdf/flight-plan-pdf";
import { buildWeightBalancePdf } from "@/modules/flight-documents/utils/pdf/weight-balance-pdf";

async function loadFormBytes() {
  const response = await fetch(CAAP_FLIGHT_PLAN_FORM_URL);

  if (!response.ok) {
    throw new Error("The CAAP flight plan form could not be loaded.");
  }

  return response.arrayBuffer();
}

// Runs in the browser (this module is imported dynamically by the download
// hook so pdf-lib never ships in the page bundle).
export async function buildFlightDocumentsPdf(
  documents: FlightDocumentsExport,
  kind: FlightDocumentKind,
): Promise<{ bytes: Uint8Array; fileName: string }> {
  const code = documents.flightPlan.planCode || "flight";

  if (kind === "weight-balance") {
    if (!documents.weightBalance) {
      throw new Error("This flight plan has no weight and balance sheet yet.");
    }

    const doc = await buildWeightBalancePdf(documents.weightBalance);

    return { bytes: await doc.save(), fileName: `${code}-weight-and-balance.pdf` };
  }

  const doc = await buildFlightPlanPdf(await loadFormBytes(), documents.flightPlan);

  if (kind === "flight-plan") {
    return { bytes: await doc.save(), fileName: `${code}-flight-plan.pdf` };
  }

  if (!documents.weightBalance) {
    throw new Error("This flight plan has no weight and balance sheet yet.");
  }

  // "Both": the sheet goes after the form and its back page.
  const sheetDoc = await buildWeightBalancePdf(documents.weightBalance);
  const [sheetPage] = await doc.copyPages(sheetDoc, [0]);
  doc.addPage(sheetPage);

  return { bytes: await doc.save(), fileName: `${code}-flight-documents.pdf` };
}

// Preview of what is on the form right now, before anything is saved.
export async function buildFlightPlanDraftPdf(
  flightPlan: FlightPlanExport,
): Promise<{ bytes: Uint8Array; fileName: string }> {
  const doc = await buildFlightPlanPdf(await loadFormBytes(), flightPlan);

  return { bytes: await doc.save(), fileName: "flight-plan-draft.pdf" };
}

export async function buildWeightBalanceDraftPdf(
  sheet: WeightBalanceExport,
): Promise<{ bytes: Uint8Array; fileName: string }> {
  const doc = await buildWeightBalancePdf(sheet);

  return { bytes: await doc.save(), fileName: "weight-and-balance-draft.pdf" };
}

export { PDFDocument };
