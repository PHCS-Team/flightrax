import { AuthShell } from "@/modules/auth/components/auth-shell";
import { ForgotPasswordForm } from "@/modules/auth/components/forgot-password-form";
import { toLinkError } from "@/modules/auth/constants/password-reset";

export function ForgotPasswordPage({ error }: { error?: string }) {
  return (
    <AuthShell
      description="We will email you a link to choose a new password. It works on any device, so you can request it here and open it on your phone."
      eyebrow="Account Recovery"
      title="Reset Your Password"
    >
      <ForgotPasswordForm linkError={toLinkError(error)} />
    </AuthShell>
  );
}
