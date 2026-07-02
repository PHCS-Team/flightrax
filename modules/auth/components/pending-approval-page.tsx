import type { ComponentProps } from "react";

import { logoutAction } from "@/modules/auth/actions/logout";
import { AuthShell } from "@/modules/auth/components/auth-shell";
import { RejectedStudentResubmissionForm } from "@/modules/auth/components/rejected-student-resubmission-form";
import { getCurrentProfile } from "@/modules/auth/queries/profile";
import { Button } from "@/shared/components/ui/button";
import { APPROVAL_STATUS, ROLE } from "@/shared/lib/rbac/config";

type LogoutFormVariant = "primary" | "secondary";
type LogoutButtonVariant = NonNullable<
  ComponentProps<typeof Button>["variant"]
>;

const LOGOUT_FORM_CONFIG = {
  primary: {
    buttonVariant: "default",
    className:
      "h-12 w-full cursor-pointer rounded-lg px-7 font-bold uppercase disabled:cursor-default sm:rounded-2xl",
    label: "Back to login options",
  },
  secondary: {
    buttonVariant: "outline",
    className:
      "h-11 w-full cursor-pointer rounded-lg border-primary-foreground/20 bg-transparent px-7 font-medium text-primary-foreground/75 hover:bg-primary-foreground/10 hover:text-primary-foreground disabled:cursor-default sm:rounded-2xl",
    label: "Return to login options",
  },
} as const satisfies Record<
  LogoutFormVariant,
  {
    buttonVariant: LogoutButtonVariant;
    className: string;
    label: string;
  }
>;

export async function PendingApprovalPage() {
  const profile = await getCurrentProfile();
  const isRejectedStudent =
    profile?.role === ROLE.STUDENT &&
    profile.approval_status === APPROVAL_STATUS.REJECTED;

  if (isRejectedStudent) {
    return (
      <AuthShell
        contentClassName="max-w-xl"
        eyebrow="Account request rejected"
        title="Update your student verification details."
        description="Your campus reviewer needs corrected identity details before FlightraX can approve your student account."
      >
        <h2 className="text-2xl mb-5 font-semibold tracking-tight">
          Resubmission Required
        </h2>
        <div className="mb-5 border-l border-primary-foreground/30 pl-4">
          <p className="text-sm font-medium text-primary-foreground/80">
            Your reviewer noted:
          </p>
          <p className="mt-1 text-sm leading-6 text-primary-foreground/70">
            {profile.rejection_reason ??
              "Your campus reviewer requested updated student verification details."}
          </p>
        </div>
        <div className="space-y-2">
          <RejectedStudentResubmissionForm
            defaultFullName={profile.full_name}
            defaultStudentIdNumber={profile.student_id_number ?? ""}
          />
          <LogoutForm variant="secondary" />
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Account request pending"
      title="Your student account is waiting for campus approval."
    >
      <div className="space-y-5">
        <h2 className="text-2xl font-semibold tracking-tight">
          Request Received
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          An instructor must approve your student profile before you can access
          FlightraX. Please check back after your campus verifies your account.
        </p>
        <LogoutForm variant="primary" />
      </div>
    </AuthShell>
  );
}

function LogoutForm({ variant = "primary" }: { variant?: LogoutFormVariant }) {
  const config = LOGOUT_FORM_CONFIG[variant];

  return (
    <form action={logoutAction}>
      <Button
        className={config.className}
        type="submit"
        variant={config.buttonVariant}
      >
        {config.label}
      </Button>
    </form>
  );
}
