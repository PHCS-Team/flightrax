import { AuthShell } from "@/modules/auth/components/auth-shell";
import { ResetPasswordForm } from "@/modules/auth/components/reset-password-form";

export function ResetPasswordPage() {
  return (
    <AuthShell
      contentClassName="sm:max-w-lg xl:max-w-xl"
      description="Set a new password to secure your FlightraX account."
      eyebrow="Account Recovery"
      title="Reset Your Password"
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}