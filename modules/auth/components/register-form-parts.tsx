import type { ComponentProps, ReactNode } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

import { AuthFieldLabel } from "@/modules/auth/components/auth-field-label";
import { LegalDocumentDialog } from "@/modules/auth/components/legal-document-dialog";
import { PasswordInput } from "@/modules/auth/components/password-input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";

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

export function RegisterTermsField({
  checked,
  error,
  id,
  onCheckedChange,
}: {
  checked: boolean;
  error?: FieldError;
  id: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-3">
      <Separator className="bg-primary-foreground/15" />
      <div className="flex items-start gap-3">
        <Checkbox
          aria-describedby={errorId}
          aria-invalid={Boolean(error)}
          aria-required="true"
          checked={checked}
          className="mt-0.5 border-primary-foreground/40 bg-primary-foreground/10 data-[state=checked]:border-primary-foreground data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary"
          id={id}
          onCheckedChange={(value) => onCheckedChange(value === true)}
        />
        <p className="text-sm leading-6 text-primary-foreground/85">
          <label className="cursor-pointer" htmlFor={id}>
            I have read and agree to the
          </label>{" "}
          <LegalDocumentDialog kind="terms" label="Terms and Conditions" />
          {" and the "}
          <LegalDocumentDialog kind="privacy" label="Privacy Policy" />.
        </p>
      </div>
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
