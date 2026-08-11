"use client";

import { Trash2Icon } from "lucide-react";

import { useDeleteLicense } from "@/modules/auth/hooks/use-delete-license.action";
import type { License } from "@/shared/types/license";
import { ConfirmationDialog } from "@/shared/components/layout/confirmation-dialog";
import { getLicenseTypeLabel } from "@/shared/lib/aviation/license-options";

export function LicenseDeleteConfirmation({
  license,
  onDeleted,
  onOpenChange,
  open,
}: {
  license: License | null;
  onDeleted?: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const deleteLicense = useDeleteLicense({
    onSaved: () => {
      onOpenChange(false);
      onDeleted?.();
    },
  });

  return (
    <ConfirmationDialog
      confirmLabel="Remove license"
      confirmingLabel="Removing..."
      description={
        license
          ? `The ${
              getLicenseTypeLabel(license.license_type) ?? license.license_type
            } license will be removed from your account. Its ID photos will also be deleted.`
          : "Remove this license from your account."
      }
      icon={Trash2Icon}
      isConfirming={deleteLicense.isExecuting}
      onConfirm={() => {
        if (license) {
          deleteLicense.execute({ licenseId: license.id });
        }
      }}
      onOpenChange={onOpenChange}
      open={open}
      title="Remove License?"
    />
  );
}
