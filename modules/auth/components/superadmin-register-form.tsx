"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";

import { registerSuperadminAction } from "@/modules/auth/actions/register-superadmin";
import {
  RegisterFormSection,
  RegisterPasswordField,
  RegisterTextField,
} from "@/modules/auth/components/register-form-parts";
import { superadminRegisterSchema } from "@/modules/auth/schemas/register-schema";
import type { SuperadminRegisterInput } from "@/modules/auth/types/auth";
import {
  AUTH_MODE,
  AUTH_MODE_CONFIG,
} from "@/modules/auth/utils/auth-role-config";
import { Button } from "@/shared/components/ui/button";
import { toastActionResult } from "@/shared/lib/action-toast";
import { ROLE } from "@/shared/lib/rbac/config";

export function SuperadminRegisterForm() {
  const router = useRouter();
  const modeConfig = AUTH_MODE_CONFIG[AUTH_MODE.REGISTER];
  const form = useForm<SuperadminRegisterInput>({
    resolver: zodResolver(superadminRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
    },
  });
  const { execute, isExecuting } = useAction(registerSuperadminAction, {
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
            id="superadmin-register-full-name"
            label="Full Name"
            placeholder="Doe, John S."
            registration={form.register("fullName")}
          />
          <RegisterTextField
            error={errors.email}
            id="superadmin-register-email"
            label="Email"
            placeholder="name@campus.edu"
            registration={form.register("email")}
            type="email"
          />
        </div>
        <RegisterPasswordField
          error={errors.password}
          id="superadmin-register-password"
          label="Password"
          placeholder="At least 8 characters"
          registration={form.register("password")}
        />
        <RegisterPasswordField
          error={errors.confirmPassword}
          id="superadmin-register-confirm-password"
          label="Confirm Password"
          placeholder="Re-enter your password"
          registration={form.register("confirmPassword")}
        />
      </RegisterFormSection>
      <Button
        className="h-12 w-full px-7 font-bold uppercase"
        disabled={isExecuting}
        type="submit"
      >
        {isExecuting ? "Creating account..." : "Create superadmin account"}
      </Button>
      <p className="text-center text-sm text-primary-foreground/70">
        {modeConfig.switchPrompt} {" "}
        <Link
          className="font-semibold text-primary-foreground underline-offset-4 transition hover:text-primary-foreground/80 hover:underline"
          href={`/${modeConfig.switchMode}/${ROLE.SUPERADMIN}`}
        >
          {modeConfig.switchLabel}
        </Link>
      </p>
    </form>
  );
}
