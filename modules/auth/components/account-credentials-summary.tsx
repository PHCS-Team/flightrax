"use client";

import { format } from "date-fns";
import { AwardIcon, IdCardIcon } from "lucide-react";

import { useCertificates } from "@/modules/auth/hooks/use-certificates.query";
import { useLicenses } from "@/modules/auth/hooks/use-licenses.query";
import {
  getLicenseTypeLabel,
  getRatingsLabels,
} from "@/shared/lib/aviation/license-options";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

function getStatusBadge(isExpired: boolean) {
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

function isPastExpiry(expiryDate: string | null) {
  const todayIso = new Date().toISOString().slice(0, 10);

  return expiryDate !== null && expiryDate < todayIso;
}

function formatExpiry(hasNoExpiry: boolean, expiryDate: string | null) {
  if (hasNoExpiry || !expiryDate) {
    return "No expiry";
  }

  return format(new Date(`${expiryDate}T00:00:00`), "MMM d, yyyy");
}

// Read-only overview for the Profile tab; management lives in the
// Licenses & Certificates tab.
export function AccountCredentialsSummary() {
  const licensesQuery = useLicenses();
  const certificatesQuery = useCertificates();
  const licenses = licensesQuery.data ?? [];
  const certificates = certificatesQuery.data ?? [];

  return (
    <GlassSurface className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground">
          <IdCardIcon className="size-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-primary-foreground">
            Licenses & Certificates
          </h2>
          <p className="mt-0.5 text-sm text-primary-foreground/70">
            Overview of your records. Manage them in the Documents tab.
          </p>
        </div>
      </div>

      {licensesQuery.isPending || certificatesQuery.isPending ? (
        <p className="animate-pulse text-sm text-primary-foreground/60">
          Loading records...
        </p>
      ) : licenses.length === 0 && certificates.length === 0 ? (
        <p className="text-sm text-primary-foreground/60">
          No licenses or certificates on file yet.
        </p>
      ) : (
        <ul className="divide-y divide-primary-foreground/10">
          {licenses.map((license) => {
            const status = getStatusBadge(
              license.status === "expired" || isPastExpiry(license.expiry_date),
            );
            const ratingLabels = getRatingsLabels(license.ratings);

            return (
              <li
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                key={license.id}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-primary-foreground">
                      {getLicenseTypeLabel(license.license_type) ??
                        license.license_type}
                    </p>
                    <span className="shrink-0 text-xs font-medium text-primary-foreground/70">
                      Expires{" "}
                      {formatExpiry(
                        license.has_no_expiry,
                        license.expiry_date,
                      )}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-primary-foreground/65">
                    {license.license_number}
                    {ratingLabels.length > 0 && ` · ${ratingLabels.join(", ")}`}
                  </p>
                </div>
                <Badge
                  className={cn("h-6 shrink-0 px-2.5", status.className)}
                  variant="outline"
                >
                  {status.label}
                </Badge>
              </li>
            );
          })}
          {certificates.map((certificate) => {
            const status = getStatusBadge(
              isPastExpiry(certificate.expiry_date),
            );

            return (
              <li
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                key={certificate.id}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <AwardIcon className="size-4 shrink-0 text-primary-foreground/60" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-primary-foreground">
                        {certificate.title}
                      </p>
                      <span className="shrink-0 text-xs font-medium text-primary-foreground/70">
                        Expires{" "}
                        {formatExpiry(
                          certificate.has_no_expiry,
                          certificate.expiry_date,
                        )}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-primary-foreground/65">
                      {certificate.description ?? "Certificate"}
                    </p>
                  </div>
                </div>
                <Badge
                  className={cn("h-6 shrink-0 px-2.5", status.className)}
                  variant="outline"
                >
                  {status.label}
                </Badge>
              </li>
            );
          })}
        </ul>
      )}
    </GlassSurface>
  );
}
