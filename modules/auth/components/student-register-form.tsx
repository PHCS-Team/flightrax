"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm, useWatch } from "react-hook-form";

import { ROLE } from "@/shared/lib/rbac/config";
import { Button } from "@/shared/components/ui/button";
import { toastActionResult } from "@/shared/lib/action-toast";
import { registerStudentAction } from "@/modules/auth/actions/register-student";
import { ImageUploadField } from "@/shared/components/image-upload-field";
import {
  RegisterFormSection,
  RegisterPasswordField,
  RegisterTextField,
} from "@/modules/auth/components/register-form-parts";
import { studentRegisterSchema } from "@/modules/auth/schemas/register-schema";
import type { StudentRegisterInput } from "@/modules/auth/types/auth";
import {
  AUTH_MODE,
  AUTH_MODE_CONFIG,
} from "@/modules/auth/utils/auth-role-config";
import {
  STUDENT_ID_DOCUMENT_MAX_BYTES,
  STUDENT_ID_DOCUMENT_TYPES,
} from "@/modules/auth/utils/student-document";
const studentIdDocumentHelperText = `Upload a JPG, PNG, or WebP image of your student ID. Max ${STUDENT_ID_DOCUMENT_MAX_BYTES / 1024 / 1024} MB.`;

export function StudentRegisterForm() {
  const router = useRouter();
  const modeConfig = AUTH_MODE_CONFIG[AUTH_MODE.REGISTER];
  const form = useForm<StudentRegisterInput>({
    resolver: zodResolver(studentRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      studentIdNumber: "",
    },
  });
  const { execute, isExecuting } = useAction(registerStudentAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.redirectTo) {
        router.push(data.redirectTo);
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
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Fill up the form below
        </h2>
      </div>
      <RegisterFormSection title="Identity">
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-3">
          <RegisterTextField
            error={errors.fullName}
            id="student-register-full-name"
            label="Full name"
            placeholder="Doe, John S."
            registration={form.register("fullName")}
          />
          <RegisterTextField
            error={errors.email}
            id="student-register-email"
            label="Email"
            placeholder="name@campus.edu"
            registration={form.register("email")}
            type="email"
          />
        </div>
        <RegisterPasswordField
          error={errors.password}
          id="student-register-password"
          label="Password"
          placeholder="At least 8 characters"
          registration={form.register("password")}
        />
        <RegisterPasswordField
          error={errors.confirmPassword}
          id="student-register-confirm-password"
          label="Confirm password"
          placeholder="Re-enter your password"
          registration={form.register("confirmPassword")}
        />
      </RegisterFormSection>
      <RegisterFormSection title="Student verification">
        <div className="grid gap-5 sm:grid-cols-2 sm:items-start sm:gap-3">
          <RegisterTextField
            error={errors.studentIdNumber}
            id="student-register-id-number"
            label="Student ID number"
            placeholder="Student ID number"
            registration={form.register("studentIdNumber")}
          />
          <ImageUploadField
            accept={STUDENT_ID_DOCUMENT_TYPES}
            errorText={errors.studentIdDocument?.message}
            helperText={studentIdDocumentHelperText}
            id="student-register-id-document"
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
            theme="dark"
            value={studentIdDocument ?? null}
            variant="compact"
          />
        </div>
      </RegisterFormSection>
      <Button
        className="mt-3 h-12 w-full px-7 font-bold uppercase"
        disabled={isExecuting}
        type="submit"
      >
        {isExecuting ? "Submitting request..." : "Submit student registration"}
      </Button>
      <p className="text-center text-sm text-primary-foreground/70">
        {modeConfig.switchPrompt}{" "}
        <Link
          className="font-semibold text-primary-foreground underline-offset-4 transition hover:text-primary-foreground/80 hover:underline"
          href={`/${modeConfig.switchMode}/${ROLE.STUDENT}`}
        >
          {modeConfig.switchLabel}
        </Link>
      </p>
    </form>
  );
}
