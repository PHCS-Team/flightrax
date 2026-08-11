"use client";

import { format } from "date-fns";
import { IdCardIcon } from "lucide-react";
import Image from "next/image";

import { useLicenseImages } from "@/shared/hooks/use-license-images.query";
import type { LicenseSummary } from "@/shared/types/license-summary";
import {
  getLicenseTypeLabel,
  getRatingsLabels,
} from "@/shared/lib/aviation/license-options";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/lib/utils";

function getStatusDetails(license: LicenseSummary) {
  const todayIso = new Date().toISOString().slice(0, 10);
  const isExpired =
    license.status === "expired" ||
    (license.expiry_date !== null && license.expiry_date < todayIso);

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

function formatExpiryDate(license: LicenseSummary) {
  if (license.has_no_expiry || !license.expiry_date) {
    return "No expiry";
  }

  return format(new Date(`${license.expiry_date}T00:00:00`), "MMM d, yyyy");
}

function LicensePhoto({
  alt,
  isLoading,
  isMissing,
  message,
  url,
}: {
  alt: string;
  isLoading: boolean;
  isMissing: boolean;
  message: string | null;
  url: string | null;
}) {
  return (
    <div className="relative h-56 w-full overflow-hidden rounded-2xl bg-muted shadow-inner ring-1 ring-border">
      {isLoading ? (
        <div className="flex size-full items-center justify-center p-4 text-center">
          <p className="text-sm text-muted-foreground">Loading photo...</p>
        </div>
      ) : url ? (
        <Image
          alt={alt}
          className="object-cover"
          fill
          sizes="(max-width: 640px) 100vw, 320px"
          src={url}
          unoptimized
        />
      ) : (
        <div className="flex size-full items-center justify-center p-4 text-center">
          <p className="text-sm text-muted-foreground">
            {isMissing ? "No photo uploaded" : (message ?? "Photo unavailable")}
          </p>
        </div>
      )}
    </div>
  );
}

export function LicenseDetailsDialog({
  license,
  onEdit,
  onOpenChange,
  open,
}: {
  license: LicenseSummary;
  onEdit?: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const { data: urls, isPending, error } = useLicenseImages(license.id, open);
  const status = getStatusDetails(license);
  const licenseTypeLabel =
    getLicenseTypeLabel(license.license_type) ?? license.license_type;
  const ratingLabels = getRatingsLabels(license.ratings);
  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "Could not load license photos."
        : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-4 overflow-y-auto p-6 sm:max-w-2xl sm:gap-5">
        <DialogSectionHeader
          description={`Added ${format(new Date(license.created_at), "MMM d, yyyy")}.`}
          icon={IdCardIcon}
          title={
            <span className="flex flex-wrap items-center gap-2">
              {licenseTypeLabel}
              <Badge
                className={cn(
                  "h-6 gap-1.5 px-2.5 capitalize",
                  status.className,
                )}
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
                License Number
              </p>
              <p className="mt-0.5 wrap-break-word text-lg font-semibold tracking-tight text-foreground">
                {license.license_number}
              </p>
            </div>
            <div className="shrink-0">
              <p className="text-[0.64rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Expiry Date
              </p>
              <p className="mt-0.5 text-base font-semibold text-foreground">
                {formatExpiryDate(license)}
              </p>
            </div>
          </div>

          {ratingLabels.length > 0 && (
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {ratingLabels.map((label) => (
                <span
                  className="inline-flex items-center rounded-full border bg-background px-2.5 py-0.5 text-xs font-medium text-foreground"
                  key={label}
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <p className="text-[0.64rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              ID Front
            </p>
            <LicensePhoto
              alt={`${licenseTypeLabel} ID front`}
              isLoading={isPending}
              isMissing={!license.id_front_path}
              message={errorMessage}
              url={urls?.frontUrl ?? null}
            />
          </div>
          <div className="grid gap-2">
            <p className="text-[0.64rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              ID Back
            </p>
            <LicensePhoto
              alt={`${licenseTypeLabel} ID back`}
              isLoading={isPending}
              isMissing={!license.id_back_path}
              message={errorMessage}
              url={urls?.backUrl ?? null}
            />
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
              Edit license
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
