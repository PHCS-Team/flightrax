"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm, useWatch } from "react-hook-form";

import { resubmitRejectedStudentAction } from "@/modules/auth/actions/resubmit-rejected-student";
import { ImageUploadField } from "@/modules/auth/components/image-upload-field";
import {
  RegisterFormSection,
  RegisterTextField,
} from "@/modules/auth/components/register-form-parts";
import { rejectedStudentResubmissionSchema } from "@/modules/auth/schemas/auth-schema";
import type { RejectedStudentResubmissionInput } from "@/modules/auth/types/auth";
import {
  STUDENT_ID_DOCUMENT_MAX_BYTES,
  STUDENT_ID_DOCUMENT_TYPES,
} from "@/modules/auth/utils/student-document";
import { Button } from "@/shared/components/ui/button";
import { toastActionResult } from "@/shared/lib/action-toast";

const studentIdDocumentHelperText = `Upload a new JPG, PNG, or WebP image of your student ID. Max ${STUDENT_ID_DOCUMENT_MAX_BYTES / 1024 / 1024} MB.`;

export function RejectedStudentResubmissionForm({
  defaultFullName,
  defaultStudentIdNumber,
}: {
  defaultFullName: string;
  defaultStudentIdNumber: string;
}) {
  const router = useRouter();
  const form = useForm<RejectedStudentResubmissionInput>({
    resolver: zodResolver(rejectedStudentResubmissionSchema),
    defaultValues: {
      fullName: defaultFullName,
      studentIdNumber: defaultStudentIdNumber,
    },
  });
  const { execute, isExecuting } = useAction(resubmitRejectedStudentAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        router.refresh();
      }
    },
  });
  const errors = form.formState.errors;
  const studentIdDocument = useWatch({
    control: form.control,
    name: "studentIdDocument",
  });

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
        className="h-12 w-full cursor-pointer rounded-lg px-7 font-bold uppercase disabled:cursor-default sm:rounded-2xl"
        disabled={isExecuting}
        type="submit"
      >
        {isExecuting ? "Resubmitting..." : "Resubmit for approval"}
      </Button>
    </form>
  );
}
