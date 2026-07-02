"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";

import { registerInstructorAction } from "@/modules/auth/actions/register-instructor";
import {
  RegisterFormSection,
  RegisterPasswordField,
  RegisterTextField,
} from "@/modules/auth/components/register-form-parts";
import { instructorRegisterSchema } from "@/modules/auth/schemas/auth-schema";
import type { InstructorRegisterInput } from "@/modules/auth/types/auth";
import {
  AUTH_MODE,
  AUTH_MODE_CONFIG,
} from "@/modules/auth/utils/auth-role-config";
import { Button } from "@/shared/components/ui/button";
import { toastActionResult } from "@/shared/lib/action-toast";
import { ROLE } from "@/shared/lib/rbac/config";

export function InstructorRegisterForm() {
  const router = useRouter();
  const modeConfig = AUTH_MODE_CONFIG[AUTH_MODE.REGISTER];
  const form = useForm<InstructorRegisterInput>({
    resolver: zodResolver(instructorRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
    },
  });
  const { execute, isExecuting } = useAction(registerInstructorAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.redirectTo) {
        router.push(data.redirectTo);
      }
    },
  });
  const errors = form.formState.errors;

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
            id="instructor-register-full-name"
            label="Full name"
            placeholder="Doe, John S."
            registration={form.register("fullName")}
          />
          <RegisterTextField
            error={errors.email}
            id="instructor-register-email"
            label="Email"
            placeholder="name@campus.edu"
            registration={form.register("email")}
            type="email"
          />
        </div>
        <RegisterPasswordField
          error={errors.password}
          id="instructor-register-password"
          label="Password"
          placeholder="At least 8 characters"
          registration={form.register("password")}
        />
        <RegisterPasswordField
          error={errors.confirmPassword}
          id="instructor-register-confirm-password"
          label="Confirm password"
          placeholder="Re-enter your password"
          registration={form.register("confirmPassword")}
        />
      </RegisterFormSection>
      <Button
        className="mt-3 h-12 w-full rounded-lg px-7 font-bold uppercase sm:rounded-2xl"
        disabled={isExecuting}
        type="submit"
      >
        {isExecuting ? "Creating account..." : "Create instructor account"}
      </Button>
      <p className="text-center text-sm text-primary-foreground/70">
        {modeConfig.switchPrompt}{" "}
        <Link
          className="font-semibold text-primary-foreground underline-offset-4 transition hover:text-primary-foreground/80 hover:underline"
          href={`/${modeConfig.switchMode}/${ROLE.INSTRUCTOR}`}
        >
          {modeConfig.switchLabel}
        </Link>
      </p>
    </form>
  );
}
