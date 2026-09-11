import { redirect } from "next/navigation";

import { AuthShell } from "@/modules/auth/components/auth-shell";
import { ResetPasswordForm } from "@/modules/auth/components/reset-password-form";
import { createClient } from "@/shared/lib/supabase/server";

export async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/forgot-password?error=expired-link");
  }

  return (
    <AuthShell
      description="Your reset link has been verified. Pick a new password to finish."
      eyebrow="Account Recovery"
      title="Choose a New Password"
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
