"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import { flightDocumentsExportQueryOptions } from "@/modules/flight-documents/queries/flight-documents-export";
import type { FlightDocumentKind } from "@/modules/flight-documents/types/flight-documents-export";
import { savePdf } from "@/modules/flight-documents/utils/pdf/save-pdf";

export type BuiltDocument = {
  bytes: Uint8Array;
  fileName: string;
};

export type DocumentBuilder = (
  kind: FlightDocumentKind,
) => Promise<BuiltDocument>;

type PreviewDocument = BuiltDocument & { url: string };

// Owns the blob URL for whatever document was built, so the preview shows
// the PDF itself rather than a lookalike.
export function useDocumentPreview() {
  const urlRef = useRef<string | null>(null);
  const [document, setDocument] = useState<PreviewDocument | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
      }
    };
  }, []);

  const build = useCallback(async (make: () => Promise<BuiltDocument>) => {
    setIsBuilding(true);
    setError(null);

    try {
      const { bytes, fileName } = await make();
      const url = URL.createObjectURL(
        new Blob([bytes as BlobPart], { type: "application/pdf" }),
      );

      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
      }

      urlRef.current = url;
      setDocument({ bytes, fileName, url });
    } catch (buildError) {
      setDocument(null);
      setError(
        buildError instanceof Error
          ? buildError.message
          : "The document could not be prepared.",
      );
    } finally {
      setIsBuilding(false);
    }
  }, []);

  const save = useCallback(() => {
    if (document) {
      savePdf(document.bytes, document.fileName);
    }
  }, [document]);

  return { build, document, error, isBuilding, save };
}

// Builds the saved documents, the same way the download does.
export function useSavedDocumentBuilder(flightPlanId: string): DocumentBuilder {
  const queryClient = useQueryClient();

  return useCallback(
    async (kind: FlightDocumentKind) => {
      const [documents, { buildFlightDocumentsPdf }] = await Promise.all([
        queryClient.fetchQuery(flightDocumentsExportQueryOptions(flightPlanId)),
        import(
          "@/modules/flight-documents/utils/pdf/build-flight-documents-pdf"
        ),
      ]);

      return buildFlightDocumentsPdf(documents, kind);
    },
    [flightPlanId, queryClient],
  );
}
