"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm, useWatch } from "react-hook-form";

import { registerAdminAction } from "@/modules/auth/actions/register-admin";
import { AuthFieldLabel } from "@/modules/auth/components/auth-field-label";
import {
  RegisterFormSection,
  RegisterPasswordField,
  RegisterTextField,
} from "@/modules/auth/components/register-form-parts";
import { adminRegisterSchema } from "@/modules/auth/schemas/auth-schema";
import type { AdminRegisterInput } from "@/modules/auth/types/auth";
import {
  AUTH_MODE,
  AUTH_MODE_CONFIG,
} from "@/modules/auth/utils/auth-role-config";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { toastActionResult } from "@/shared/lib/action-toast";
import { ADMIN_DEPARTMENT_LABELS, ROLE } from "@/shared/lib/rbac/config";

export function AdminRegisterForm() {
  const router = useRouter();
  const modeConfig = AUTH_MODE_CONFIG[AUTH_MODE.REGISTER];
  const form = useForm<AdminRegisterInput>({
    resolver: zodResolver(adminRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      adminDepartment: undefined,
    },
  });
  const { execute, isExecuting } = useAction(registerAdminAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.redirectTo) {
        router.push(data.redirectTo);
      }
    },
  });
  const errors = form.formState.errors;
  const selectedAdminDepartment = useWatch({
    control: form.control,
    name: "adminDepartment",
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
            id="admin-register-full-name"
            label="Full name"
            placeholder="Doe, John S."
            registration={form.register("fullName")}
          />
          <RegisterTextField
            error={errors.email}
            id="admin-register-email"
            label="Email"
            placeholder="name@campus.edu"
            registration={form.register("email")}
            type="email"
          />
        </div>
        <RegisterPasswordField
          error={errors.password}
          id="admin-register-password"
          label="Password"
          placeholder="At least 8 characters"
          registration={form.register("password")}
        />
        <RegisterPasswordField
          error={errors.confirmPassword}
          id="admin-register-confirm-password"
          label="Confirm password"
          placeholder="Re-enter your password"
          registration={form.register("confirmPassword")}
        />
      </RegisterFormSection>
      <RegisterFormSection title="Department">
        <div className="space-y-2">
          <AuthFieldLabel htmlFor="admin-register-department" required>
            Department
          </AuthFieldLabel>
          <Select
            onValueChange={(value) => {
              form.setValue(
                "adminDepartment",
                value as AdminRegisterInput["adminDepartment"],
                { shouldDirty: true, shouldValidate: true },
              );
            }}
            value={selectedAdminDepartment ?? ""}
          >
            <SelectTrigger
              aria-describedby={
                errors.adminDepartment
                  ? "admin-register-department-error"
                  : undefined
              }
              aria-invalid={Boolean(errors.adminDepartment)}
              aria-required="true"
              id="admin-register-department"
            >
              <SelectValue placeholder="Choose department" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ADMIN_DEPARTMENT_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.adminDepartment && (
            <p
              className="text-sm text-destructive"
              id="admin-register-department-error"
            >
              {errors.adminDepartment.message}
            </p>
          )}
        </div>
      </RegisterFormSection>
      <Button
        className="mt-3 h-12 w-full rounded-lg px-7 font-bold uppercase sm:rounded-2xl"
        disabled={isExecuting}
        type="submit"
      >
        {isExecuting ? "Creating account..." : "Create admin account"}
      </Button>
      <p className="text-center text-sm text-primary-foreground/70">
        {modeConfig.switchPrompt}{" "}
        <Link
          className="font-semibold text-primary-foreground underline-offset-4 transition hover:text-primary-foreground/80 hover:underline"
          href={`/${modeConfig.switchMode}/${ROLE.ADMIN}`}
        >
          {modeConfig.switchLabel}
        </Link>
      </p>
    </form>
  );
}
