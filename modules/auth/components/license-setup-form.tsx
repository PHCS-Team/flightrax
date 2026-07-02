"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm, useWatch } from "react-hook-form";

import { updateLicenseSetupAction } from "@/modules/auth/actions/update-license-setup";
import type { LicenseSetupInput } from "@/modules/auth/types/auth";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { toastActionResult } from "@/shared/lib/action-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  LICENSE_TYPE_OPTIONS,
  RATING_OPTIONS,
} from "@/shared/lib/aviation/license-options";
import { cn } from "@/shared/lib/utils";
import { licenseDetailsSchema } from "@/shared/validations/license-schema";

type LicenseSetupFormProps = {
  onSaved?: () => void;
  surface?: "default" | "onPrimary";
};

export function LicenseSetupForm({
  onSaved,
  surface = "default",
}: LicenseSetupFormProps) {
  const router = useRouter();
  const form = useForm<LicenseSetupInput>({
    resolver: zodResolver(licenseDetailsSchema),
    defaultValues: {
      licenseType: undefined,
      licenseNumber: "",
      rating: undefined,
    },
  });
  const { execute, isExecuting } = useAction(updateLicenseSetupAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        router.refresh();
        onSaved?.();
      }
    },
  });
  const errors = form.formState.errors;
  const selectedLicenseType = useWatch({
    control: form.control,
    name: "licenseType",
  });
  const selectedRating = useWatch({
    control: form.control,
    name: "rating",
  });
  const labelClassName = cn(
    "text-sm font-semibold",
    surface === "onPrimary" ? "text-primary-foreground/90" : "text-foreground",
  );

  return (
    <form
      className="grid gap-5"
      onSubmit={form.handleSubmit((values) => execute(values))}
    >
      <div className="grid gap-2">
        <label className={labelClassName} htmlFor="license-setup-type">
          License type
          <span className="ml-1 text-secondary">*</span>
        </label>
        <Select
          onValueChange={(value) =>
            form.setValue(
              "licenseType",
              value as LicenseSetupInput["licenseType"],
              {
                shouldDirty: true,
                shouldValidate: true,
              },
            )
          }
          value={selectedLicenseType}
        >
          <SelectTrigger
            aria-describedby={
              errors.licenseType ? "license-setup-type-error" : undefined
            }
            aria-invalid={Boolean(errors.licenseType)}
            aria-required="true"
            id="license-setup-type"
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
        {errors.licenseType && (
          <p className="text-sm text-destructive" id="license-setup-type-error">
            {errors.licenseType.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <label className={labelClassName} htmlFor="license-setup-number">
          License number
          <span className="ml-1 text-secondary">*</span>
        </label>
        <Input
          aria-describedby={
            errors.licenseNumber ? "license-setup-number-error" : undefined
          }
          aria-invalid={Boolean(errors.licenseNumber)}
          aria-required="true"
          id="license-setup-number"
          placeholder="Enter license number"
          {...form.register("licenseNumber")}
        />
        {errors.licenseNumber && (
          <p
            className="text-sm text-destructive"
            id="license-setup-number-error"
          >
            {errors.licenseNumber.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <label className={labelClassName} htmlFor="license-setup-rating">
          Rating
          <span className="ml-1 text-secondary">*</span>
        </label>
        <Select
          onValueChange={(value) =>
            form.setValue("rating", value as LicenseSetupInput["rating"], {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          value={selectedRating}
        >
          <SelectTrigger
            aria-describedby={
              errors.rating ? "license-setup-rating-error" : undefined
            }
            aria-invalid={Boolean(errors.rating)}
            aria-required="true"
            id="license-setup-rating"
          >
            <SelectValue placeholder="Choose rating" />
          </SelectTrigger>
          <SelectContent>
            {RATING_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.rating && (
          <p
            className="text-sm text-destructive"
            id="license-setup-rating-error"
          >
            {errors.rating.message}
          </p>
        )}
      </div>

      <Button
        className="h-12 w-full rounded-lg px-7 font-bold uppercase sm:rounded-2xl"
        disabled={isExecuting}
        type="submit"
      >
        {isExecuting ? "Saving license..." : "Save license details"}
      </Button>
    </form>
  );
}
