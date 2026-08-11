"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AwardIcon, CalendarClockIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useCreateCertificate } from "@/modules/auth/hooks/use-create-certificate.action";
import { useUpdateCertificate } from "@/modules/auth/hooks/use-update-certificate.action";
import { useCertificateImage } from "@/modules/auth/hooks/use-certificate-image.query";
import { CertificateDeleteConfirmation } from "@/modules/auth/components/certificate-delete-confirmation";
import { certificateFormSchema } from "@/modules/auth/schemas/certificate-schema";
import type { CertificateFormInput } from "@/modules/auth/schemas/certificate-schema";
import type { Certificate } from "@/modules/auth/types/certificate";
import {
  CERTIFICATE_IMAGE_MAX_BYTES,
  CERTIFICATE_IMAGE_TYPES,
} from "@/modules/auth/utils/certificate";
import { ImageUploadField } from "@/shared/components/image-upload-field";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import { Textarea } from "@/shared/components/ui/textarea";

const CERTIFICATE_PHOTO_HELPER_TEXT = `JPG, PNG, or WebP only. Maximum file size is ${CERTIFICATE_IMAGE_MAX_BYTES / 1024 / 1024} MB. New uploads replace the current image.`;

function getDefaultValues(
  certificate?: Certificate | null,
): CertificateFormInput {
  return {
    title: certificate?.title ?? "",
    description: certificate?.description ?? "",
    has_no_expiry: certificate?.has_no_expiry ?? false,
    expiry_date: certificate?.expiry_date ?? "",
    image: undefined,
  };
}

export function CertificateFormDialog({
  certificate,
  onOpenChange,
  open,
}: {
  certificate?: Certificate | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const isEditing = Boolean(certificate);
  const dialogId = certificate?.id ?? "new-certificate";
  const [deleteOpen, setDeleteOpen] = useState(false);
  const form = useForm<CertificateFormInput>({
    resolver: zodResolver(certificateFormSchema),
    defaultValues: getDefaultValues(certificate),
  });
  const createCertificate = useCreateCertificate({
    onSaved: () => handleSaved(),
  });
  const updateCertificate = useUpdateCertificate({
    onSaved: () => handleSaved(),
  });
  const { data: existingImage } = useCertificateImage(
    certificate?.id ?? "",
    open && isEditing,
  );
  const errors = form.formState.errors;
  const hasNoExpiry = useWatch({
    control: form.control,
    name: "has_no_expiry",
  });
  const selectedImage = useWatch({
    control: form.control,
    name: "image",
  });
  const isExecuting =
    createCertificate.isExecuting || updateCertificate.isExecuting;

  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues(certificate));
    }
  }, [certificate, form, open]);

  function handleSaved() {
    onOpenChange(false);
  }

  function handleSubmit(values: CertificateFormInput) {
    if (certificate) {
      updateCertificate.execute({ ...values, certificateId: certificate.id });
      return;
    }

    if (!values.image) {
      form.setError("image", {
        type: "custom",
        message: "Choose a certificate image.",
      });
      return;
    }

    createCertificate.execute(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-6 sm:max-w-lg">
        <DialogSectionHeader
          description={
            isEditing
              ? "Update the certificate details and replace the image when needed."
              : "Add a certificate to keep your training records up to date."
          }
          icon={AwardIcon}
          title={isEditing ? "Edit Certificate" : "Add Certificate"}
        />

        <form className="grid gap-5" onSubmit={form.handleSubmit(handleSubmit)}>
          <h3 className="-mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Certificate Details
          </h3>

          <div className="grid gap-2">
            <label
              className="text-sm font-semibold text-foreground"
              htmlFor={`${dialogId}-title`}
            >
              Certificate Title
              <span className="ml-1 text-secondary">*</span>
            </label>
            <Input
              aria-describedby={
                errors.title ? `${dialogId}-title-error` : undefined
              }
              aria-invalid={Boolean(errors.title)}
              aria-required="true"
              id={`${dialogId}-title`}
              placeholder="Enter certificate title"
              {...form.register("title")}
            />
            {errors.title && (
              <p
                className="text-sm text-destructive"
                id={`${dialogId}-title-error`}
              >
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <label
              className="text-sm font-semibold text-foreground"
              htmlFor={`${dialogId}-description`}
            >
              Description
            </label>
            <Textarea
              aria-invalid={Boolean(errors.description)}
              id={`${dialogId}-description`}
              placeholder="Add optional notes about this certificate"
              {...form.register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-3 rounded-xl border border-secondary/40 bg-secondary/5 p-4 sm:rounded-2xl">
            <div className="flex items-center gap-2">
              <CalendarClockIcon className="size-4 shrink-0 text-secondary" />
              <label
                className="text-sm font-semibold text-foreground"
                htmlFor={`${dialogId}-expiry`}
              >
                Certificate Expiry Date
                {!hasNoExpiry && <span className="ml-1 text-secondary">*</span>}
              </label>
            </div>
            {hasNoExpiry ? (
              <div className="flex h-12 w-full items-center rounded-lg border border-dashed border-border bg-muted/40 px-4 py-1 text-base text-muted-foreground md:h-10 md:text-sm sm:rounded-2xl">
                No expiry date
              </div>
            ) : (
              <Input
                aria-describedby={
                  errors.expiry_date ? `${dialogId}-expiry-error` : undefined
                }
                aria-invalid={Boolean(errors.expiry_date)}
                aria-required="true"
                id={`${dialogId}-expiry`}
                type="date"
                {...form.register("expiry_date")}
              />
            )}
            {errors.expiry_date && (
              <p
                className="text-sm text-destructive"
                id={`${dialogId}-expiry-error`}
              >
                {errors.expiry_date.message}
              </p>
            )}

            <label
              className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border bg-background px-3.5 py-3"
              htmlFor={`${dialogId}-no-expiry`}
            >
              <Checkbox
                checked={hasNoExpiry}
                className="mt-0.5"
                id={`${dialogId}-no-expiry`}
                onCheckedChange={(checked) => {
                  form.setValue("has_no_expiry", checked === true, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              />
              <span className="grid gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  No Expiry Date
                </span>
                <span className="text-xs text-muted-foreground">
                  Choose this if this certificate never expires
                </span>
              </span>
            </label>
          </div>

          <h3 className="-mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Certificate Image
          </h3>

          <ImageUploadField
            accept={CERTIFICATE_IMAGE_TYPES}
            currentImageUrl={
              isEditing ? (existingImage?.imageUrl ?? null) : null
            }
            errorText={errors.image?.message}
            helperText={CERTIFICATE_PHOTO_HELPER_TEXT}
            id={`${dialogId}-image`}
            label="Certificate Image"
            onChange={(file) =>
              form.setValue("image", file ?? undefined, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            required={!isEditing || !certificate?.image_path}
            value={selectedImage ?? null}
          />

          <DialogFooter className="-mx-6 -mb-6 mt-1 sm:justify-end">
            {isEditing && (
              <>
                <Button
                  className="w-full sm:mr-auto sm:w-auto"
                  disabled={isExecuting}
                  onClick={() => setDeleteOpen(true)}
                  type="button"
                  variant="destructive"
                >
                  <Trash2Icon className="size-4" />
                  Remove certificate
                </Button>
                <Separator className="sm:hidden" />
              </>
            )}
            <Button
              className="w-full sm:w-auto"
              disabled={isExecuting}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="w-full sm:w-auto"
              disabled={isExecuting}
              type="submit"
            >
              {isExecuting
                ? isEditing
                  ? "Saving..."
                  : "Adding..."
                : isEditing
                  ? "Save certificate"
                  : "Add certificate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <CertificateDeleteConfirmation
        certificate={certificate ?? null}
        onDeleted={() => onOpenChange(false)}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
      />
    </Dialog>
  );
}
