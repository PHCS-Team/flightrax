"use client";

import { DownloadIcon, FileTextIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { PdfDocumentView } from "@/modules/flight-documents/components/pdf-document-view";
import type { DocumentBuilder } from "@/modules/flight-documents/hooks/use-flight-documents-preview";
import { useDocumentPreview } from "@/modules/flight-documents/hooks/use-flight-documents-preview";
import type { FlightDocumentKind } from "@/modules/flight-documents/types/flight-documents-export";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { cn } from "@/shared/lib/utils";

const KIND_LABELS = {
  "flight-plan": "Flight Plan",
  "weight-balance": "Weight & Balance",
  both: "Flight Documents",
} satisfies Record<FlightDocumentKind, string>;

export function FlightDocumentsPreviewDialog({
  buildDocument,
  initialKind,
  kinds,
  onOpenChange,
  open,
}: {
  buildDocument: DocumentBuilder;
  initialKind: FlightDocumentKind;
  kinds: FlightDocumentKind[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const isMobile = useIsMobile();
  const { build, document, error, isBuilding, save } = useDocumentPreview();
  const [kind, setKind] = useState<FlightDocumentKind>(initialKind);

  useEffect(() => {
    void build(() => buildDocument(kind));
  }, [build, buildDocument, kind]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="top-0 left-0 h-dvh max-h-dvh w-screen max-w-none translate-x-0 translate-y-0 gap-0 rounded-none p-0 sm:top-1/2 sm:left-1/2 sm:h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-2rem)] sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:gap-4 sm:rounded-xl sm:p-6">
        <div className="flex h-full min-h-0 flex-col">
          <div className="shrink-0 border-b bg-popover p-3 pr-12 sm:border-0 sm:p-0 sm:pr-8">
            <DialogSectionHeader
              description={
                isMobile
                  ? "Exactly as it downloads."
                  : "The document exactly as it downloads and prints."
              }
              icon={FileTextIcon}
              title={KIND_LABELS[kind]}
            />

            {kinds.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {kinds.map((option) => (
                  <Button
                    className={cn(
                      "h-9",
                      option !== kind &&
                        "border-border bg-transparent text-foreground hover:bg-muted",
                    )}
                    key={option}
                    onClick={() => setKind(option)}
                    size="sm"
                    type="button"
                    variant={option === kind ? "default" : "outline"}
                  >
                    {KIND_LABELS[option]}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-hidden bg-muted/60 sm:mt-4 sm:rounded-2xl sm:border sm:bg-muted/40">
            {isBuilding ? (
              <div className="flex h-full items-center justify-center p-6 text-center">
                <p className="animate-pulse text-sm text-muted-foreground">
                  Preparing the document...
                </p>
              </div>
            ) : error ? (
              <div className="flex h-full items-center justify-center p-6 text-center">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            ) : document ? (
              <PdfDocumentView
                bytes={document.bytes}
                className="h-full"
                label={KIND_LABELS[kind]}
              />
            ) : null}
          </div>

          <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:-mx-6 sm:-mb-6 sm:mt-4 sm:rounded-b-xl sm:pb-4 sm:justify-end">
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Close
            </Button>
            <Button disabled={!document} onClick={save} type="button">
              <DownloadIcon className="size-4" />
              Download
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
