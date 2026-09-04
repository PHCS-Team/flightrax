"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { flightDocumentsExportQueryOptions } from "@/modules/flight-documents/queries/flight-documents-export";
import type { FlightDocumentKind } from "@/modules/flight-documents/types/flight-documents-export";
import { savePdf } from "@/modules/flight-documents/utils/pdf/save-pdf";

export function useDownloadFlightDocuments(flightPlanId: string) {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<FlightDocumentKind | null>(null);

  async function download(kind: FlightDocumentKind) {
    if (pending) {
      return;
    }

    setPending(kind);

    try {
      const [documents, { buildFlightDocumentsPdf }] = await Promise.all([
        queryClient.fetchQuery(flightDocumentsExportQueryOptions(flightPlanId)),
        import("@/modules/flight-documents/utils/pdf/build-flight-documents-pdf"),
      ]);
      const { bytes, fileName } = await buildFlightDocumentsPdf(
        documents,
        kind,
      );

      savePdf(bytes, fileName);
      toast.success(`Downloading ${fileName}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The PDF could not be generated.",
      );
    } finally {
      setPending(null);
    }
  }

  return { download, pending };
}
