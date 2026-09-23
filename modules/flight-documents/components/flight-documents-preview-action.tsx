"use client";

import { FileTextIcon } from "lucide-react";
import { useState } from "react";

import { FlightDocumentsPreviewDialog } from "@/modules/flight-documents/components/flight-documents-preview-dialog";
import type { DocumentBuilder } from "@/modules/flight-documents/hooks/use-flight-documents-preview";
import type { FlightDocumentKind } from "@/modules/flight-documents/types/flight-documents-export";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export function FlightDocumentsPreviewAction({
  buildDocument,
  className,
  kinds,
  label = "View document",
}: {
  buildDocument: DocumentBuilder;
  className?: string;
  kinds: FlightDocumentKind[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className={cn(
          "h-10 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground",
          className,
        )}
        onClick={() => setOpen(true)}
        type="button"
        variant="outline"
      >
        <FileTextIcon className="size-4" />
        {label}
      </Button>

      {open && (
        <FlightDocumentsPreviewDialog
          buildDocument={buildDocument}
          initialKind={kinds[0]}
          kinds={kinds}
          onOpenChange={setOpen}
          open
        />
      )}
    </>
  );
}
