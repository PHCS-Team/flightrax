// Turns a Supabase error (Postgres, PostgREST, Storage or Auth) into a
// sentence a pilot or admin can act on. The raw error goes to the server
// log; the user never sees a constraint name or an SQLSTATE.
//
// Every `{ ok: false, message }` in an action and every `throw new Error`
// in a server service passes through here. When a caller knows something
// more specific ("That time overlaps another entry on the same row"), it
// says that instead and only falls back to this.

type ServiceError = {
  code?: string | null;
  details?: string | null;
  hint?: string | null;
  message: string;
  name?: string;
  status?: number;
};

const DEFAULT_MESSAGE = "Something went wrong. Please try again.";

const AUTH_MESSAGES: Record<string, string> = {
  invalid_credentials: "Wrong email or password.",
  email_exists: "An account with this email already exists.",
  user_already_exists: "An account with this email already exists.",
  email_not_confirmed: "Confirm your email before signing in.",
  email_address_invalid: "Enter a valid email address.",
  user_not_found: "No account matches that email.",
  weak_password: "Choose a stronger password.",
  same_password: "Use a password you have not used before.",
  reauthentication_needed: "Sign in again to make this change.",
  session_expired: "Your session has expired. Sign in again.",
  session_not_found: "Your session has expired. Sign in again.",
  bad_jwt: "Your session has expired. Sign in again.",
  otp_expired: "This link has expired. Request a new one.",
  signup_disabled: "Sign-ups are closed right now.",
  user_banned: "This account has been suspended.",
  over_request_rate_limit:
    "Too many attempts. Wait a few minutes and try again.",
  over_email_send_rate_limit:
    "Too many emails sent. Wait a few minutes and try again.",
  request_timeout: "This took too long. Try again.",
};

const DATABASE_MESSAGES: Record<string, string> = {
  "23505": "This already exists. Check for a duplicate.",
  "23503": "This is still linked to other records and cannot be changed.",
  "23514": "Some of the values are not allowed. Check the form and try again.",
  "23502": "A required value is missing. Check the form and try again.",
  "23P01": "This overlaps with something that already exists.",
  "22001": "One of the values is too long.",
  "22P02": "One of the values is in the wrong format.",
  "42501": "You do not have permission to do this.",
  "57014": "This took too long. Try again.",
  PGRST116: "This record no longer exists.",
  PGRST301: "Your session has expired. Sign in again.",
};

const MESSAGE_PATTERNS: [RegExp, string][] = [
  [/invalid login credentials/i, AUTH_MESSAGES.invalid_credentials],
  [/already registered|already exists/i, AUTH_MESSAGES.email_exists],
  [/rate limit/i, AUTH_MESSAGES.over_request_rate_limit],
  [/password should be/i, AUTH_MESSAGES.weak_password],
  [
    /the resource already exists/i,
    "A file with this name already exists. Try again.",
  ],
  [
    /payload too large|maximum allowed size|entity too large/i,
    "That file is too large.",
  ],
  [
    /bucket not found|object not found|not found/i,
    "This record no longer exists.",
  ],
  [
    /fetch failed|network|econn|socket hang up|timed out/i,
    "Could not reach the server. Check your connection and try again.",
  ],
];

export function describeActionError(
  error: ServiceError | string | null | undefined,
  fallback = DEFAULT_MESSAGE,
): string {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  console.error("[action]", error);

  if (error.code) {
    const known = AUTH_MESSAGES[error.code] ?? DATABASE_MESSAGES[error.code];

    if (known) {
      return known;
    }
  }

  for (const [pattern, message] of MESSAGE_PATTERNS) {
    if (pattern.test(error.message)) {
      return message;
    }
  }

  return fallback;
}
