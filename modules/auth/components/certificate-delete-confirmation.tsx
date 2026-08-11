"use client";

import { Trash2Icon } from "lucide-react";

import { useDeleteCertificate } from "@/modules/auth/hooks/use-delete-certificate.action";
import type { Certificate } from "@/modules/auth/types/certificate";
import { ConfirmationDialog } from "@/shared/components/layout/confirmation-dialog";

export function CertificateDeleteConfirmation({
  certificate,
  onDeleted,
  onOpenChange,
  open,
}: {
  certificate: Certificate | null;
  onDeleted?: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const deleteCertificate = useDeleteCertificate({
    onSaved: () => {
      onOpenChange(false);
      onDeleted?.();
    },
  });

  return (
    <ConfirmationDialog
      confirmLabel="Remove certificate"
      confirmingLabel="Removing..."
      description={
        certificate
          ? `"${certificate.title}" will be removed from your account. Its image will also be deleted.`
          : "Remove this certificate from your account."
      }
      icon={Trash2Icon}
      isConfirming={deleteCertificate.isExecuting}
      onConfirm={() => {
        if (certificate) {
          deleteCertificate.execute({ certificateId: certificate.id });
        }
      }}
      onOpenChange={onOpenChange}
      open={open}
      title="Remove Certificate?"
    />
  );
}
