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
import { AccountVerificationFields } from "@/modules/auth/components/account-verification-fields";
import {
  RegisterFormSection,
  RegisterPasswordField,
  RegisterTextField,
} from "@/modules/auth/components/register-form-parts";
import { ACCOUNT_REQUEST_COPY } from "@/modules/auth/utils/account-request-copy";
import { studentRegisterSchema } from "@/modules/auth/schemas/register-schema";
import type { StudentRegisterInput } from "@/modules/auth/types/auth";
import {
  AUTH_MODE,
  AUTH_MODE_CONFIG,
} from "@/modules/auth/utils/auth-role-config";

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
      idNumber: "",
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
  const idDocument = useWatch({
    control: form.control,
    name: "idDocument",
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
            label="Full Name"
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
          label="Confirm Password"
          placeholder="Re-enter your password"
          registration={form.register("confirmPassword")}
        />
      </RegisterFormSection>
      <RegisterFormSection title={ACCOUNT_REQUEST_COPY[ROLE.STUDENT].sectionTitle}>
        <AccountVerificationFields
          idDocument={idDocument ?? null}
          idDocumentError={errors.idDocument?.message}
          idNumberError={errors.idNumber}
          idNumberRegistration={form.register("idNumber")}
          idPrefix="student-register"
          onIdDocumentChange={(file) => {
            if (file) {
              form.setValue("idDocument", file, {
                shouldValidate: true,
              });
              return;
            }

            form.unregister("idDocument");
            void form.trigger("idDocument");
          }}
          role={ROLE.STUDENT}
        />
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
