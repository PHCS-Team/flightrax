"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { AccountVerificationFields } from "@/modules/auth/components/account-verification-fields";
import { useResubmitRejectedAccount } from "@/modules/auth/hooks/use-resubmit-rejected-account.action";
import {
  RegisterFormSection,
  RegisterTextField,
} from "@/modules/auth/components/register-form-parts";
import { rejectedAccountResubmissionSchema } from "@/modules/auth/schemas/rejected-account-resubmission-schema";
import type { RejectedAccountResubmissionInput } from "@/modules/auth/types/auth";
import { Button } from "@/shared/components/ui/button";
import type { AccountRequestRole } from "@/shared/lib/rbac/config";

export function RejectedAccountResubmissionForm({
  currentDocumentUrl,
  defaultFullName,
  defaultIdNumber,
  onResubmitted,
  role,
}: {
  currentDocumentUrl: string | null;
  defaultFullName: string;
  defaultIdNumber: string;
  onResubmitted?: () => void;
  role: AccountRequestRole;
}) {
  const [resubmitted, setResubmitted] = useState(false);
  const form = useForm<RejectedAccountResubmissionInput>({
    resolver: zodResolver(rejectedAccountResubmissionSchema),
    defaultValues: {
      fullName: defaultFullName,
      idNumber: defaultIdNumber,
    },
  });
  const { execute, isExecuting } = useResubmitRejectedAccount({
    onResubmitted: () => {
      setResubmitted(true);
      onResubmitted?.();
    },
  });
  const errors = form.formState.errors;
  const idDocument = useWatch({
    control: form.control,
    name: "idDocument",
  });

  if (resubmitted && !onResubmitted) {
    return (
      <div className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 p-5 text-primary-foreground">
        <h3 className="text-lg font-semibold tracking-tight">
          Request Received
        </h3>
        <p className="mt-2 text-sm leading-6 text-primary-foreground/70">
          Your corrected verification details were resubmitted. Please check
          back after your campus reviewer approves your account.
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) => execute(values))}
    >
      <RegisterFormSection title="Corrected Identity">
        <RegisterTextField
          error={errors.fullName}
          id="rejected-account-full-name"
          label="Full Name"
          placeholder="Doe, John S."
          registration={form.register("fullName")}
        />
      </RegisterFormSection>
      <RegisterFormSection title="Verification Document">
        <AccountVerificationFields
          currentImageUrl={currentDocumentUrl}
          disabled={isExecuting}
          idDocument={idDocument ?? null}
          idDocumentError={errors.idDocument?.message}
          idNumberError={errors.idNumber}
          idNumberRegistration={form.register("idNumber")}
          idPrefix="rejected-account"
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
          role={role}
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
