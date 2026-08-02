"use client";

import { format } from "date-fns";
import { EyeIcon, IdCardIcon, PencilIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

import { LicenseDetailsDialog } from "@/shared/components/license-details-dialog";
import { LicenseFormDialog } from "@/modules/auth/components/license-form-dialog";
import { useLicenses } from "@/modules/auth/hooks/use-licenses.query";
import type { License } from "@/shared/types/license";
import {
  getLicenseTypeLabel,
  getRatingsLabels,
} from "@/shared/lib/aviation/license-options";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

const DARK_OUTLINE_BUTTON_CLASS =
  "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground";

function getStatusDetails(license: License) {
  const todayIso = new Date().toISOString().slice(0, 10);
  const isExpired =
    license.status === "expired" ||
    (license.expiry_date !== null && license.expiry_date < todayIso);

  return isExpired
    ? {
        label: "Expired",
        className:
          "border-destructive/35 bg-destructive/15 text-primary-foreground",
      }
    : {
        label: "Active",
        className: "border-success/40 bg-success/20 text-primary-foreground",
      };
}

function formatExpiryDate(license: License) {
  if (license.has_no_expiry || !license.expiry_date) {
    return "No expiry";
  }

  return format(new Date(`${license.expiry_date}T00:00:00`), "MMM d, yyyy");
}

export function AccountLicenseSection() {
  const { data, isPending, error } = useLicenses();
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [detailsLicense, setDetailsLicense] = useState<License | null>(null);

  if (isPending) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <EmptyState
        description={error.message}
        icon={<IdCardIcon className="size-7" />}
        title="Licenses could not be loaded"
      />
    );
  }

  const licenses = data ?? [];

  function openCreateDialog() {
    setEditingLicense(null);
    setFormDialogOpen(true);
  }

  function openEditDialog(license: License) {
    setEditingLicense(license);
    setFormDialogOpen(true);
  }

  return (
    <div className="space-y-4">
      {licenses.length === 0 ? (
        <EmptyState
          action={
            <Button
              className={DARK_OUTLINE_BUTTON_CLASS}
              onClick={openCreateDialog}
              type="button"
              variant="outline"
            >
              <PlusIcon className="size-4" />
              Add license
            </Button>
          }
          description="You need at least one license on file to file flight plans. Add your license type, number, and ID photos."
          icon={<IdCardIcon className="size-7" />}
          title="No Licenses Yet"
        />
      ) : (
        <GlassSurface className="overflow-hidden">
          <div className="flex items-center gap-3 border-b border-primary-foreground/10 px-5 py-4 md:px-6 md:py-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground">
              <IdCardIcon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold tracking-tight text-primary-foreground">
                Licenses
              </h2>
              <p className="mt-0.5 text-sm text-primary-foreground/70">
                Your licenses and ratings on file.
              </p>{" "}
            </div>
            <Button
              className={cn("shrink-0", DARK_OUTLINE_BUTTON_CLASS)}
              onClick={openCreateDialog}
              type="button"
              variant="outline"
            >
              <PlusIcon className="size-4" />
              Add license
            </Button>
          </div>

          <div className="divide-y divide-primary-foreground/10">
            {licenses.map((license) => {
              const status = getStatusDetails(license);
              const licenseTypeLabel =
                getLicenseTypeLabel(license.license_type) ??
                license.license_type;
              const ratingLabels = getRatingsLabels(license.ratings);

              return (
                <div
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6 md:py-5"
                  key={license.id}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-base font-semibold text-primary-foreground">
                        {licenseTypeLabel}
                      </p>
                      <Badge
                        className={cn(
                          "h-6 shrink-0 gap-1.5 px-2.5 capitalize",
                          status.className,
                        )}
                        variant="outline"
                      >
                        {status.label}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-sm text-primary-foreground/70">
                      {license.license_number}
                      {ratingLabels.length > 0 &&
                        ` · ${ratingLabels.join(", ")}`}
                      {` · Expires ${formatExpiryDate(license)}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                    <Button
                      className={DARK_OUTLINE_BUTTON_CLASS}
                      onClick={() => setDetailsLicense(license)}
                      type="button"
                      variant="outline"
                    >
                      <EyeIcon className="size-4" />
                      View details
                    </Button>
                    <Button
                      className={DARK_OUTLINE_BUTTON_CLASS}
                      onClick={() => openEditDialog(license)}
                      type="button"
                      variant="outline"
                    >
                      <PencilIcon className="size-4" />
                      Edit
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassSurface>
      )}

      <LicenseFormDialog
        key={editingLicense?.id ?? "new"}
        license={editingLicense}
        onOpenChange={setFormDialogOpen}
        open={formDialogOpen}
      />

      {detailsLicense && (
        <LicenseDetailsDialog
          license={detailsLicense}
          onEdit={() => {
            setEditingLicense(detailsLicense);
            setDetailsLicense(null);
            setFormDialogOpen(true);
          }}
          onOpenChange={(open) => {
            if (!open) {
              setDetailsLicense(null);
            }
          }}
          open
        />
      )}
    </div>
  );
}
