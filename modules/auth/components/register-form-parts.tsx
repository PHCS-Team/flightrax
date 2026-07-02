import type { ComponentProps, ReactNode } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

import { AuthFieldLabel } from "@/modules/auth/components/auth-field-label";
import { PasswordInput } from "@/modules/auth/components/password-input";
import { Input } from "@/shared/components/ui/input";

type RegisterTextFieldProps = {
  error?: FieldError;
  id: string;
  label: string;
  placeholder: string;
  registration: UseFormRegisterReturn;
  type?: ComponentProps<typeof Input>["type"];
};

type RegisterPasswordFieldProps = {
  error?: FieldError;
  id: string;
  label: string;
  placeholder: string;
  registration: UseFormRegisterReturn;
};

export function RegisterFormSection({
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

export function RegisterTextField({
  error,
  id,
  label,
  placeholder,
  registration,
  type,
}: RegisterTextFieldProps) {
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

export function RegisterPasswordField({
  error,
  id,
  label,
  placeholder,
  registration,
}: RegisterPasswordFieldProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-2">
      <AuthFieldLabel htmlFor={id} required>
        {label}
      </AuthFieldLabel>
      <PasswordInput
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        aria-required="true"
        id={id}
        placeholder={placeholder}
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
