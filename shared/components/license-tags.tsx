import { EyeIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

import type { LicenseSummary } from "@/shared/types/license-summary";
import { getLicenseTypeLabel } from "@/shared/lib/aviation/license-options";

const MAX_VISIBLE_LICENSES = 2;

export function LicenseTags({
  licenses,
  onLicenseClick,
  tone = "default",
}: {
  licenses: LicenseSummary[];
  onLicenseClick?: (license: LicenseSummary) => void;
  tone?: "default" | "destructive";
}) {
  if (licenses.length === 0) {
    return <p className="text-sm text-primary-foreground/65">No licenses</p>;
  }

  const visible = licenses.slice(0, MAX_VISIBLE_LICENSES);
  const hiddenCount = licenses.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((license) => {
        const label =
          getLicenseTypeLabel(license.license_type) ?? license.license_type;

        if (onLicenseClick) {
          return (
            <button
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                tone === "destructive"
                  ? "border-red-200/40 bg-red-700/40 text-red-50 hover:bg-red-700/55"
                  : "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15",
              )}
              key={license.id}
              onClick={() => onLicenseClick(license)}
              title={`${label} · No. ${license.license_number}`}
              type="button"
            >
              <EyeIcon className="size-3 text-primary-foreground/70" />
              {label}
            </button>
          );
        }

        return (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-dashed px-2.5 py-0.5 text-xs font-medium",
              tone === "destructive"
                ? "border-red-200/30 text-red-100/60"
                : "border-primary-foreground/15 text-primary-foreground/45",
            )}
            key={license.id}
            title={`${label} · No. ${license.license_number}`}
          >
            {label}
          </span>
        );
      })}
      {hiddenCount > 0 && (
        <span className="text-sm text-primary-foreground/65">
          +{hiddenCount} more
        </span>
      )}
    </div>
  );
}
