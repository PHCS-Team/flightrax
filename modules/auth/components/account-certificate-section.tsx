"use client";

import { format } from "date-fns";
import { AwardIcon, EyeIcon, PencilIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

import { CertificateDetailsDialog } from "@/modules/auth/components/certificate-details-dialog";
import { CertificateFormDialog } from "@/modules/auth/components/certificate-form-dialog";
import { useCertificates } from "@/modules/auth/hooks/use-certificates.query";
import type { Certificate } from "@/modules/auth/types/certificate";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

const DARK_OUTLINE_BUTTON_CLASS =
  "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground";

function getStatusDetails(certificate: Certificate) {
  const todayIso = new Date().toISOString().slice(0, 10);
  const isExpired =
    certificate.expiry_date !== null && certificate.expiry_date < todayIso;

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

function formatExpiryDate(certificate: Certificate) {
  if (certificate.has_no_expiry || !certificate.expiry_date) {
    return "No expiry";
  }

  return format(new Date(`${certificate.expiry_date}T00:00:00`), "MMM d, yyyy");
}

export function AccountCertificateSection() {
  const { data, isPending, error } = useCertificates();
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] =
    useState<Certificate | null>(null);
  const [detailsCertificate, setDetailsCertificate] =
    useState<Certificate | null>(null);

  if (isPending) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <EmptyState
        description={error.message}
        icon={<AwardIcon className="size-7" />}
        title="Certificates could not be loaded"
      />
    );
  }

  const certificates = data ?? [];

  function openCreateDialog() {
    setEditingCertificate(null);
    setFormDialogOpen(true);
  }

  function openEditDialog(certificate: Certificate) {
    setEditingCertificate(certificate);
    setFormDialogOpen(true);
  }

  return (
    <div className="space-y-4">
      {certificates.length === 0 ? (
        <EmptyState
          action={
            <Button
              className={DARK_OUTLINE_BUTTON_CLASS}
              onClick={openCreateDialog}
              type="button"
              variant="outline"
            >
              <PlusIcon className="size-4" />
              Add certificate
            </Button>
          }
          description="Keep your training records complete by adding your certificates with an image and expiry date."
          icon={<AwardIcon className="size-7" />}
          title="No Certificates Yet"
        />
      ) : (
        <GlassSurface className="overflow-hidden">
          <div className="flex items-center gap-3 border-b border-primary-foreground/10 px-5 py-4 md:px-6 md:py-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground">
              <AwardIcon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold tracking-tight text-primary-foreground">
                Certificates
              </h2>
              <p className="mt-0.5 text-sm text-primary-foreground/70">
                Your certificates on file.
              </p>
            </div>
            <Button
              className={cn("shrink-0", DARK_OUTLINE_BUTTON_CLASS)}
              onClick={openCreateDialog}
              size="sm"
              type="button"
              variant="outline"
            >
              <PlusIcon className="size-4" />
              <span className="hidden sm:inline">Add certificate</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>

          <div className="divide-y divide-primary-foreground/10">
            {certificates.map((certificate) => {
              const status = getStatusDetails(certificate);

              return (
                <div
                  className="flex items-center justify-between gap-3 px-5 py-4 md:px-6 md:py-5"
                  key={certificate.id}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-base font-semibold text-primary-foreground">
                        {certificate.title}
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
                      {certificate.description && `${certificate.description} · `}
                      Expires {formatExpiryDate(certificate)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      className={DARK_OUTLINE_BUTTON_CLASS}
                      onClick={() => setDetailsCertificate(certificate)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <EyeIcon className="size-4" />
                      <span className="hidden sm:inline">View details</span>
                    </Button>
                    <Button
                      className={DARK_OUTLINE_BUTTON_CLASS}
                      onClick={() => openEditDialog(certificate)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <PencilIcon className="size-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassSurface>
      )}

      <CertificateFormDialog
        key={editingCertificate?.id ?? "new"}
        certificate={editingCertificate}
        onOpenChange={setFormDialogOpen}
        open={formDialogOpen}
      />

      {detailsCertificate && (
        <CertificateDetailsDialog
          certificate={detailsCertificate}
          onEdit={() => {
            setEditingCertificate(detailsCertificate);
            setDetailsCertificate(null);
            setFormDialogOpen(true);
          }}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setDetailsCertificate(null);
            }
          }}
          open
        />
      )}
    </div>
  );
}
