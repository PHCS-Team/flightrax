"use client";

import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import {
  useForm,
  useWatch,
  type FieldError,
  type UseFormRegisterReturn,
} from "react-hook-form";

import { ROLE } from "@/shared/lib/rbac/config";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { toastActionResult } from "@/shared/lib/action-toast";
import { registerStudentAction } from "@/modules/auth/actions/register-student";
import { AuthFieldLabel } from "@/modules/auth/components/auth-field-label";
import { ImageUploadField } from "@/modules/auth/components/image-upload-field";
import { PasswordInput } from "@/modules/auth/components/password-input";
import { studentRegisterSchema } from "@/modules/auth/schemas/auth-schema";
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

type StudentTextFieldProps = {
  error?: FieldError;
  id: string;
  label: string;
  placeholder: string;
  registration: UseFormRegisterReturn;
  type?: ComponentProps<typeof Input>["type"];
};

function StudentTextField({
  error,
  id,
  label,
  placeholder,
  registration,
  type,
}: StudentTextFieldProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-2">
      <AuthFieldLabel htmlFor={id} required>
        {label}
      </AuthFieldLabel>
      <Input
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        aria-required="true"
        id={id}
        placeholder={placeholder}
        type={type}
        {...registration}
      />
      {error && (
        <p className="text-sm text-destructive" id={errorId}>
          {error.message}
        </p>
      )}
    </div>
  );
}

function StudentFormSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-widest text-primary-foreground/70">
        {title}
      </h3>
      {children}
    </section>
  );
}

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
      <StudentFormSection title="Identity">
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-3">
          <StudentTextField
            error={errors.fullName}
            id="student-register-full-name"
            label="Full name"
            placeholder="Doe, John S."
            registration={form.register("fullName")}
          />
          <StudentTextField
            error={errors.email}
            id="student-register-email"
            label="Email"
            placeholder="name@campus.edu"
            registration={form.register("email")}
            type="email"
          />
        </div>
        <div className="space-y-2">
          <AuthFieldLabel htmlFor="student-register-password" required>
            Password
          </AuthFieldLabel>
          <PasswordInput
            aria-describedby={
              errors.password ? "student-register-password-error" : undefined
            }
            aria-invalid={Boolean(errors.password)}
            aria-required="true"
            id="student-register-password"
            placeholder="At least 8 characters"
            {...form.register("password")}
          />
          {errors.password && (
            <p
              className="text-sm text-destructive"
              id="student-register-password-error"
            >
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <AuthFieldLabel htmlFor="student-register-confirm-password" required>
            Confirm password
          </AuthFieldLabel>
          <PasswordInput
            aria-describedby={
              errors.confirmPassword
                ? "student-register-confirm-password-error"
                : undefined
            }
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-required="true"
            id="student-register-confirm-password"
            placeholder="Re-enter your password"
            {...form.register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p
              className="text-sm text-destructive"
              id="student-register-confirm-password-error"
            >
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </StudentFormSection>
      <StudentFormSection title="Student verification">
        <div className="grid gap-5 sm:grid-cols-2 sm:items-start sm:gap-3">
          <StudentTextField
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
            value={studentIdDocument ?? null}
            variant="compact"
          />
        </div>
      </StudentFormSection>
      <Button
        className="h-12 w-full rounded-lg px-7 font-bold uppercase sm:rounded-2xl"
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
