"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { IdCardIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm, useWatch } from "react-hook-form";

import { updateStudentLicenseAction } from "@/modules/students/actions/update-student-license";
import {
  updateStudentLicenseSchema,
  type UpdateStudentLicenseInput,
} from "@/modules/students/schemas/student-license-schema";
import type { ApprovedStudent } from "@/modules/students/types/student";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  isLicenseTypeValue,
  isRatingValue,
  LICENSE_TYPE_OPTIONS,
  RATING_OPTIONS,
} from "@/shared/lib/aviation/license-options";
import { toastActionResult } from "@/shared/lib/action-toast";

export function StudentLicenseEditDialog({
  student,
}: {
  student: ApprovedStudent;
}) {
  const router = useRouter();
  const form = useForm<UpdateStudentLicenseInput>({
    resolver: zodResolver(updateStudentLicenseSchema),
    defaultValues: {
      studentId: student.id,
      licenseType: isLicenseTypeValue(student.licenseType)
        ? student.licenseType
        : undefined,
      licenseNumber: student.licenseNumber ?? "",
      rating: isRatingValue(student.rating) ? student.rating : undefined,
    },
  });
  const { execute, isExecuting } = useAction(
    updateStudentLicenseAction,
    {
      onSuccess: ({ data }) => {
        toastActionResult(data);

        if (data?.ok) {
          router.refresh();
        }
      },
    },
  );
  const errors = form.formState.errors;
  const selectedLicenseType = useWatch({
    control: form.control,
    name: "licenseType",
  });
  const selectedRating = useWatch({
    control: form.control,
    name: "rating",
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
          size="sm"
          type="button"
          variant="outline"
        >
          Edit License
        </Button>
      </DialogTrigger>
      <DialogContent className="p-6 sm:max-w-lg">
        <DialogSectionHeader
          description={`Update the active license and rating for ${student.fullName}.`}
          icon={IdCardIcon}
          title="Edit license details"
        />
        <form
          className="grid gap-5"
          onSubmit={form.handleSubmit((values: UpdateStudentLicenseInput) =>
            execute(values),
          )}
        >
          <input type="hidden" {...form.register("studentId")} />
          <div className="grid gap-2">
            <label
              className="text-sm font-semibold text-foreground"
              htmlFor={`student-license-type-${student.id}`}
            >
              License type
              <span className="ml-1 text-secondary">*</span>
            </label>
            <Select
              onValueChange={(value) =>
                form.setValue(
                  "licenseType",
                  value as UpdateStudentLicenseInput["licenseType"],
                  { shouldDirty: true, shouldValidate: true },
                )
              }
              value={selectedLicenseType}
            >
              <SelectTrigger
                aria-describedby={
                  errors.licenseType
                    ? `student-license-type-${student.id}-error`
                    : undefined
                }
                aria-invalid={Boolean(errors.licenseType)}
                aria-required="true"
                id={`student-license-type-${student.id}`}
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
              <p
                className="text-sm text-destructive"
                id={`student-license-type-${student.id}-error`}
              >
                {errors.licenseType.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <label
              className="text-sm font-semibold text-foreground"
              htmlFor={`student-license-number-${student.id}`}
            >
              License number
              <span className="ml-1 text-secondary">*</span>
            </label>
            <Input
              aria-describedby={
                errors.licenseNumber
                  ? `student-license-number-${student.id}-error`
                  : undefined
              }
              aria-invalid={Boolean(errors.licenseNumber)}
              aria-required="true"
              id={`student-license-number-${student.id}`}
              placeholder="Enter license number"
              {...form.register("licenseNumber")}
            />
            {errors.licenseNumber && (
              <p
                className="text-sm text-destructive"
                id={`student-license-number-${student.id}-error`}
              >
                {errors.licenseNumber.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <label
              className="text-sm font-semibold text-foreground"
              htmlFor={`student-rating-${student.id}`}
            >
              Rating
              <span className="ml-1 text-secondary">*</span>
            </label>
            <Select
              onValueChange={(value) =>
                form.setValue(
                  "rating",
                  value as UpdateStudentLicenseInput["rating"],
                  { shouldDirty: true, shouldValidate: true },
                )
              }
              value={selectedRating}
            >
              <SelectTrigger
                aria-describedby={
                  errors.rating ? `student-rating-${student.id}-error` : undefined
                }
                aria-invalid={Boolean(errors.rating)}
                aria-required="true"
                id={`student-rating-${student.id}`}
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
                id={`student-rating-${student.id}-error`}
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
      </DialogContent>
    </Dialog>
  );
}
