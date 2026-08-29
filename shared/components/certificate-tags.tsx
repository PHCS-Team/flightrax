import { EyeIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

import type { CertificateSummary } from "@/shared/types/certificate-summary";

const MAX_VISIBLE_CERTIFICATES = 2;

export function CertificateTags({
  certificates,
  onCertificateClick,
  tone = "default",
}: {
  certificates: CertificateSummary[];
  onCertificateClick?: (certificate: CertificateSummary) => void;
  tone?: "default" | "destructive";
}) {
  if (certificates.length === 0) {
    return (
      <p className="text-sm text-primary-foreground/65">No certificates</p>
    );
  }

  const visible = certificates.slice(0, MAX_VISIBLE_CERTIFICATES);
  const hiddenCount = certificates.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((certificate) => {
        if (onCertificateClick) {
          return (
            <button
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                tone === "destructive"
                  ? "border-red-200/40 bg-red-700/40 text-red-50 hover:bg-red-700/55"
                  : "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15",
              )}
              key={certificate.id}
              onClick={() => onCertificateClick(certificate)}
              title={certificate.title}
              type="button"
            >
              <EyeIcon className="size-3 text-primary-foreground/70" />
              {certificate.title}
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
            key={certificate.id}
            title={certificate.title}
          >
            {certificate.title}
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
