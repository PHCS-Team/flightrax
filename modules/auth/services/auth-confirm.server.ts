import "server-only";

import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/shared/lib/supabase/server";

const EMAIL_OTP_TYPES: readonly EmailOtpType[] = [
  "recovery",
  "signup",
  "invite",
  "magiclink",
  "email_change",
  "email",
];

export function isEmailOtpType(value: string | null): value is EmailOtpType {
  return value !== null && (EMAIL_OTP_TYPES as readonly string[]).includes(value);
}

// Exchanges the token_hash from an email link for a session.
//
// This is used instead of the PKCE code flow on purpose. PKCE stores a
// verifier in the browser that requested the email, so the link only works
// in that same browser — a student who asks for a reset on a lab PC and
// opens the email on their phone gets a dead link. A token hash carries
// everything needed, so any device works.
export async function confirmEmailToken(
  tokenHash: string,
  type: EmailOtpType,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  return error ? { ok: false, message: error.message } : { ok: true };
}

// A recovery link must land on the password form; everything else (signup
// confirmation, invites) is simply "you are signed in now", and the proxy
// routes an unapproved account on to /pending-approval from there.
export function getConfirmDestination(type: EmailOtpType): string {
  return type === "recovery" ? "/reset-password" : "/dashboard";
}
