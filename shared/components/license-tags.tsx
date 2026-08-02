import type { LicenseSummary } from "@/shared/types/license-summary";
import { getLicenseTypeLabel } from "@/shared/lib/aviation/license-options";

const MAX_VISIBLE_LICENSES = 2;

export function LicenseTags({
  licenses,
  onLicenseClick,
}: {
  licenses: LicenseSummary[];
  onLicenseClick?: (license: LicenseSummary) => void;
}) {
  if (licenses.length === 0) {
    return (
      <p className="text-sm text-primary-foreground/65">No licenses</p>
    );
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
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-2.5 py-0.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/15"
              key={license.id}
              onClick={() => onLicenseClick(license)}
              title={`${label} · No. ${license.license_number}`}
              type="button"
            >
              {label}
            </button>
          );
        }

        return (
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-2.5 py-0.5 text-xs font-medium text-primary-foreground"
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
