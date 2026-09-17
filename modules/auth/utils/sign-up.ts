import type { User } from "@supabase/supabase-js";

export const EXISTING_ACCOUNT_MESSAGE =
  "An account with this email already exists. Sign in instead.";

// With email confirmation on, Supabase does not return an error for an email
// that is already registered: it returns a placeholder user with no
// identities, so the response cannot be used to discover accounts. A second
// tap on Register lands here, and must stop before anything is written
// against that placeholder id.
export function isExistingAccountSignUp(user: User): boolean {
  return Array.isArray(user.identities) && user.identities.length === 0;
}
