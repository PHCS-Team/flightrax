"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDownIcon, IdCardIcon, Trash2Icon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useCreateLicense } from "@/modules/auth/hooks/use-create-license.action";
import { useUpdateLicense } from "@/modules/auth/hooks/use-update-license.action";
import { LicenseDeleteConfirmation } from "@/modules/auth/components/license-delete-confirmation";
import { licenseFormSchema } from "@/modules/auth/schemas/license-schema";
import type { LicenseFormInput } from "@/modules/auth/schemas/license-schema";
import { useLicenseImages } from "@/shared/hooks/use-license-images.query";
import type { License } from "@/shared/types/license";
import {
  LICENSE_IMAGE_MAX_BYTES,
  LICENSE_IMAGE_TYPES,
} from "@/modules/auth/utils/license";
import { ImageUploadField } from "@/shared/components/image-upload-field";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { LICENSE_TYPE_OPTIONS } from "@/shared/lib/aviation/license-options";
import { useRatingOptions } from "@/shared/hooks/use-rating-options.query";
import { cn } from "@/shared/lib/utils";

const LICENSE_PHOTO_HELPER_TEXT = `JPG, PNG, or WebP only. Maximum file size is ${LICENSE_IMAGE_MAX_BYTES / 1024 / 1024} MB. New uploads replace the current photo.`;

function getDefaultValues(license?: License | null): LicenseFormInput {
  return {
    license_type: license?.license_type ?? "",
    license_number: license?.license_number ?? "",
    ratings: license?.ratings ?? [],
    has_no_expiry: license?.has_no_expiry ?? false,
    expiry_date: license?.expiry_date ?? "",
    status: license?.status ?? "active",
    idFront: undefined,
    idBack: undefined,
  };
}

export function LicenseFormDialog({
  license,
  onOpenChange,
  open,
}: {
  license?: License | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const isEditing = Boolean(license);
  const dialogId = license?.id ?? "new-license";
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { ratingOptions } = useRatingOptions();
  const form = useForm<LicenseFormInput>({
    resolver: zodResolver(licenseFormSchema),
    defaultValues: getDefaultValues(license),
  });
  const createLicense = useCreateLicense({
    onSaved: () => handleSaved(),
  });
  const updateLicense = useUpdateLicense({
    onSaved: () => handleSaved(),
  });
  const { data: existingImages } = useLicenseImages(
    license?.id ?? "",
    open && isEditing,
  );
  const errors = form.formState.errors;
  const selectedLicenseType = useWatch({
    control: form.control,
    name: "license_type",
  });
  const selectedRatingsRaw = useWatch({
    control: form.control,
    name: "ratings",
  });
  const hasNoExpiry = useWatch({
    control: form.control,
    name: "has_no_expiry",
  });
  const selectedFrontPhoto = useWatch({
    control: form.control,
    name: "idFront",
  });
  const selectedBackPhoto = useWatch({
    control: form.control,
    name: "idBack",
  });
  const isExecuting = createLicense.isExecuting || updateLicense.isExecuting;
  const selectedRatings = selectedRatingsRaw ?? [];
  const ratingLabels = selectedRatings
    .map(
      (value) =>
        ratingOptions.find((option) => option.value === value)?.label ?? value,
    )
    .filter(Boolean);

  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues(license));
    }
  }, [form, license, open]);

  function handleSaved() {
    onOpenChange(false);
  }

  function toggleRating(value: string) {
    const ratings = selectedRatingsRaw ?? [];
    const nextRatings = ratings.includes(value)
      ? ratings.filter((rating) => rating !== value)
      : [...ratings, value];

    form.setValue("ratings", nextRatings, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function handleSubmit(values: LicenseFormInput) {
    if (license) {
      updateLicense.execute({ ...values, licenseId: license.id });
      return;
    }

    if (!values.idFront) {
      form.setError("idFront", {
        type: "custom",
        message: "Choose a license image.",
      });
    }

    if (!values.idBack) {
      form.setError("idBack", {
        type: "custom",
        message: "Choose a license image.",
      });
    }

    if (!values.idFront || !values.idBack) {
      return;
    }

    createLicense.execute(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-6 sm:max-w-lg">
        <DialogSectionHeader
          description={
            isEditing
              ? "Update the license details and replace the ID photos when needed."
              : "Add a license so you can file flight plans and keep your records up to date."
          }
          icon={IdCardIcon}
          title={isEditing ? "Edit License" : "Add License"}
        />

        <form className="grid gap-5" onSubmit={form.handleSubmit(handleSubmit)}>
          <h3 className="-mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            License Details
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label
                className="text-sm font-semibold text-foreground"
                htmlFor={`${dialogId}-type`}
              >
                License Type
                <span className="ml-1 text-secondary">*</span>
              </label>
              <Select
                onValueChange={(value) =>
                  form.setValue("license_type", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                value={selectedLicenseType}
              >
                <SelectTrigger
                  aria-invalid={Boolean(errors.license_type)}
                  aria-required="true"
                  id={`${dialogId}-type`}
                >
                  <SelectValue placeholder="Choose license type" />
                </SelectTrigger>
                <SelectContent>
                  {LICENSE_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.license_type && (
                <p className="text-sm text-destructive">
                  {errors.license_type.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <label
                className="text-sm font-semibold text-foreground"
                htmlFor={`${dialogId}-number`}
              >
                License Number
                <span className="ml-1 text-secondary">*</span>
              </label>
              <Input
                aria-describedby={
                  errors.license_number ? `${dialogId}-number-error` : undefined
                }
                aria-invalid={Boolean(errors.license_number)}
                aria-required="true"
                id={`${dialogId}-number`}
                placeholder="Enter license number"
                {...form.register("license_number")}
              />
              {errors.license_number && (
                <p
                  className="text-sm text-destructive"
                  id={`${dialogId}-number-error`}
                >
                  {errors.license_number.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <label
              className="text-sm font-semibold text-foreground"
              htmlFor={`${dialogId}-expiry`}
            >
              License Expiry Date
              {!hasNoExpiry && <span className="ml-1 text-secondary">*</span>}
            </label>
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
              className="mt-2 flex cursor-pointer items-start gap-2.5 rounded-lg border border-border bg-muted/40 px-3.5 py-3"
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
                  Choose this if this license never expires
                </span>
              </span>
            </label>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-foreground">
              Ratings
            </label>
            <Popover>
              <PopoverTrigger
                aria-invalid={Boolean(errors.ratings)}
                className={cn(
                  "flex min-h-12 w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-lg border border-input bg-transparent px-3 py-2 text-base text-[#121212] transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 md:min-h-10 md:text-sm sm:rounded-2xl",
                )}
                id={`${dialogId}-ratings`}
                type="button"
              >
                {ratingLabels.length > 0 ? (
                  <>
                    {/* min-w-0 + shrinkable badges: a long rating label
                        truncates instead of widening the dialog on mobile. */}
                    <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                      {ratingLabels.slice(0, 2).map((label) => (
                        <Badge
                          className="h-6 min-w-0 max-w-full shrink gap-1 bg-muted px-2 text-foreground"
                          key={label}
                          variant="outline"
                        >
                          <span className="truncate">{label}</span>
                          <span
                            className="flex size-3.5 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
                            onClick={(event) => {
                              event.preventDefault();
                              toggleRating(
                                ratingOptions.find(
                                  (option) => option.label === label,
                                )?.value ?? label,
                              );
                            }}
                          >
                            <XIcon className="size-3" />
                          </span>
                        </Badge>
                      ))}
                      {ratingLabels.length > 2 && (
                        <span className="text-sm text-muted-foreground">
                          +{ratingLabels.length - 2} more
                        </span>
                      )}
                    </span>
                    <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
                  </>
                ) : (
                  <>
                    <span className="min-w-0 flex-1 text-left font-normal text-muted-foreground">
                      Choose ratings
                    </span>
                    <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
                  </>
                )}
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-(--radix-popover-trigger-width) p-0"
                sideOffset={6}
              >
                <Command>
                  <CommandInput placeholder="Search ratings..." />
                  <CommandList>
                    <CommandEmpty>No rating found.</CommandEmpty>
                    <CommandGroup>
                      {ratingOptions.map((option) => {
                        const isSelected = (selectedRatingsRaw ?? []).includes(
                          option.value,
                        );

                        return (
                          <CommandItem
                            key={option.value}
                            onSelect={() => toggleRating(option.value)}
                            value={option.value}
                          >
                            <Checkbox
                              aria-label={`Select ${option.label}`}
                              checked={isSelected}
                              onCheckedChange={() => toggleRating(option.value)}
                            />
                            <span className="flex-1">{option.label}</span>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.ratings && (
              <p className="text-sm text-destructive">
                {errors.ratings.message}
              </p>
            )}
          </div>

          <h3 className="-mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            ID Photos
          </h3>

          <div className="grid gap-4">
            <ImageUploadField
              accept={LICENSE_IMAGE_TYPES}
              currentImageUrl={
                isEditing ? (existingImages?.frontUrl ?? null) : null
              }
              errorText={errors.idFront?.message}
              helperText={LICENSE_PHOTO_HELPER_TEXT}
              id={`${dialogId}-id-front`}
              label="ID Front Photo"
              onChange={(file) =>
                form.setValue("idFront", file ?? undefined, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              required={!isEditing || !license?.id_front_path}
              value={selectedFrontPhoto ?? null}
            />
            <ImageUploadField
              accept={LICENSE_IMAGE_TYPES}
              currentImageUrl={
                isEditing ? (existingImages?.backUrl ?? null) : null
              }
              errorText={errors.idBack?.message}
              helperText={LICENSE_PHOTO_HELPER_TEXT}
              id={`${dialogId}-id-back`}
              label="ID Back Photo"
              onChange={(file) =>
                form.setValue("idBack", file ?? undefined, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              required={!isEditing || !license?.id_back_path}
              value={selectedBackPhoto ?? null}
            />
          </div>

          {isEditing && (
            <div className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 sm:flex-row sm:items-center sm:justify-between sm:rounded-2xl">
              <p className="text-xs text-muted-foreground">
                Removing this license deletes its photos and cannot be undone.
              </p>
              <Button
                className="shrink-0 border-destructive/40 bg-background text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={isExecuting}
                onClick={() => setDeleteOpen(true)}
                size="sm"
                type="button"
                variant="outline"
              >
                <Trash2Icon className="size-4" />
                Remove license
              </Button>
            </div>
          )}

          <DialogFooter className="-mx-6 -mb-6 mt-1 sm:justify-end">
            <Button
              disabled={isExecuting}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isExecuting} type="submit">
              {isExecuting
                ? isEditing
                  ? "Saving..."
                  : "Adding..."
                : isEditing
                  ? "Save license"
                  : "Add license"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <LicenseDeleteConfirmation
        license={license ?? null}
        onDeleted={() => onOpenChange(false)}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
      />
    </Dialog>
  );
}
