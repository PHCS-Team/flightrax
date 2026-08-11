"use client";

import { format } from "date-fns";
import { AwardIcon } from "lucide-react";
import Image from "next/image";

import { useCertificateImage } from "@/modules/auth/hooks/use-certificate-image.query";
import type { Certificate } from "@/modules/auth/types/certificate";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/lib/utils";

function getStatusDetails(certificate: Certificate) {
  const todayIso = new Date().toISOString().slice(0, 10);
  const isExpired =
    certificate.expiry_date !== null && certificate.expiry_date < todayIso;

  return isExpired
    ? {
        label: "Expired",
        className: "border-destructive/35 bg-destructive/15 text-foreground",
      }
    : {
        label: "Active",
        className: "border-success/40 bg-success/20 text-foreground",
      };
}

function formatExpiryDate(certificate: Certificate) {
  if (certificate.has_no_expiry || !certificate.expiry_date) {
    return "No expiry";
  }

  return format(new Date(`${certificate.expiry_date}T00:00:00`), "MMM d, yyyy");
}

export function CertificateDetailsDialog({
  certificate,
  onEdit,
  onOpenChange,
  open,
}: {
  certificate: Certificate;
  onEdit?: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const {
    data: image,
    isPending,
    error,
  } = useCertificateImage(certificate.id, open);
  const status = getStatusDetails(certificate);
  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "Could not load the certificate image."
        : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-4 overflow-y-auto p-6 sm:max-w-lg sm:gap-5">
        <DialogSectionHeader
          description={`Added ${format(new Date(certificate.created_at), "MMM d, yyyy")}.`}
          icon={AwardIcon}
          title={
            <span className="flex flex-wrap items-center gap-2">
              {certificate.title}
              <Badge
                className={cn("h-6 gap-1.5 px-2.5 capitalize", status.className)}
                variant="outline"
              >
                {status.label}
              </Badge>
            </span>
          }
        />

        <div className="rounded-xl border bg-muted/40 p-3.5 shadow-xs sm:rounded-2xl sm:p-4">
          <div className="flex flex-col gap-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="min-w-0">
              <p className="text-[0.64rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Description
              </p>
              <p className="mt-0.5 wrap-break-word text-sm leading-6 text-foreground">
                {certificate.description ?? "No description provided."}
              </p>
            </div>
            <div className="shrink-0">
              <p className="text-[0.64rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Expiry Date
              </p>
              <p className="mt-0.5 text-base font-semibold text-foreground">
                {formatExpiryDate(certificate)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <p className="text-[0.64rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Certificate Image
          </p>
          <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-muted shadow-inner ring-1 ring-border">
            {isPending ? (
              <div className="flex size-full items-center justify-center p-4 text-center">
                <p className="animate-pulse text-sm text-muted-foreground">
                  Loading image...
                </p>
              </div>
            ) : image?.imageUrl ? (
              <Image
                alt={`${certificate.title} certificate`}
                className="object-contain"
                fill
                sizes="(max-width: 640px) 100vw, 480px"
                src={image.imageUrl}
                unoptimized
              />
            ) : (
              <div className="flex size-full items-center justify-center p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {certificate.image_path
                    ? (errorMessage ?? "Image unavailable")
                    : "No image uploaded"}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="-mx-6 -mb-6 mt-2 sm:justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Close
          </Button>
          {onEdit && (
            <Button onClick={onEdit} type="button">
              Edit certificate
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
