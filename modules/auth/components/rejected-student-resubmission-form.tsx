"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { ImageUploadField } from "@/modules/auth/components/image-upload-field";
import { useResubmitRejectedStudent } from "@/modules/auth/hooks/use-resubmit-rejected-student.action";
import {
  RegisterFormSection,
  RegisterTextField,
} from "@/modules/auth/components/register-form-parts";
import { rejectedStudentResubmissionSchema } from "@/modules/auth/schemas/rejected-student-resubmission-schema";
import type { RejectedStudentResubmissionInput } from "@/modules/auth/types/auth";
import {
  STUDENT_ID_DOCUMENT_MAX_BYTES,
  STUDENT_ID_DOCUMENT_TYPES,
} from "@/modules/auth/utils/student-document";
import { Button } from "@/shared/components/ui/button";

const studentIdDocumentHelperText = `Upload a new JPG, PNG, or WebP image of your student ID. Max ${STUDENT_ID_DOCUMENT_MAX_BYTES / 1024 / 1024} MB.`;

export function RejectedStudentResubmissionForm({
  defaultFullName,
  defaultStudentIdNumber,
  onResubmitted,
}: {
  defaultFullName: string;
  defaultStudentIdNumber: string;
  onResubmitted?: () => void;
}) {
  const [resubmitted, setResubmitted] = useState(false);
  const form = useForm<RejectedStudentResubmissionInput>({
    resolver: zodResolver(rejectedStudentResubmissionSchema),
    defaultValues: {
      fullName: defaultFullName,
      studentIdNumber: defaultStudentIdNumber,
    },
  });
  const { execute, isExecuting } = useResubmitRejectedStudent({
    onResubmitted: () => {
      setResubmitted(true);
      onResubmitted?.();
    },
  });
  const errors = form.formState.errors;
  const studentIdDocument = useWatch({
    control: form.control,
    name: "studentIdDocument",
  });

  if (resubmitted && !onResubmitted) {
    return (
      <div className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 p-5 text-primary-foreground">
        <h3 className="text-lg font-semibold tracking-tight">
          Request received
        </h3>
        <p className="mt-2 text-sm leading-6 text-primary-foreground/70">
          Your corrected student verification details were resubmitted. Please
          check back after your campus reviewer approves your account.
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) => execute(values))}
    >
      <RegisterFormSection title="Corrected identity">
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-3">
          <RegisterTextField
            error={errors.fullName}
            id="rejected-student-full-name"
            label="Full name"
            placeholder="Doe, John S."
            registration={form.register("fullName")}
          />
          <RegisterTextField
            error={errors.studentIdNumber}
            id="rejected-student-id-number"
            label="Student ID number"
            placeholder="Student ID number"
            registration={form.register("studentIdNumber")}
          />
        </div>
      </RegisterFormSection>
      <RegisterFormSection title="Replacement document">
        <ImageUploadField
          accept={STUDENT_ID_DOCUMENT_TYPES}
          disabled={isExecuting}
          errorText={errors.studentIdDocument?.message}
          helperText={studentIdDocumentHelperText}
          id="rejected-student-id-document"
          label="Student ID image"
          onChange={(file) => {
            if (file) {
              form.setValue("studentIdDocument", file, {
                shouldValidate: true,
              });
              return;
            }

            form.unregister("studentIdDocument");
            void form.trigger("studentIdDocument");
          }}
          required
          value={studentIdDocument ?? null}
          variant="compact"
        />
      </RegisterFormSection>
      <Button
        className="h-12 w-full px-7 font-bold uppercase"
        disabled={isExecuting}
        type="submit"
      >
        {isExecuting ? "Resubmitting..." : "Resubmit for approval"}
      </Button>
    </form>
  );
}
