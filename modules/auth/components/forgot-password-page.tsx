import { AuthShell } from "@/modules/auth/components/auth-shell";
import { ForgotPasswordForm } from "@/modules/auth/components/forgot-password-form";

export function ForgotPasswordPage() {
  return (
    <AuthShell
      contentClassName="sm:max-w-lg xl:max-w-xl"
      description="Enter the email address on your FlightraX account and we'll send you a secure link to reset your password."
      eyebrow="Account Recovery"
      title="Reset Your Password"
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}