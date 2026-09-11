// Plain module on purpose: forgot-password-page (a server component) and
// forgot-password-form (a client component) both need this. A value exported
// from a "use client" file reaches server code as a client reference, not the
// real array, so it cannot be defined alongside the form.
export const LINK_ERRORS = ["invalid-link", "expired-link"] as const;

export type LinkError = (typeof LINK_ERRORS)[number];

export function toLinkError(value: string | undefined): LinkError | null {
  return (LINK_ERRORS as readonly string[]).includes(value ?? "")
    ? (value as LinkError)
    : null;
}
