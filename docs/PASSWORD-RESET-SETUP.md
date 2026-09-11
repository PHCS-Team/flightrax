# Password Reset — Setup Outside the Repo

The code for forgot/reset password is complete and needs **no environment
variables**. Everything below is dashboard configuration; until it is done,
the forms render and behave correctly but no email is delivered.

**How it works, so the settings make sense:** the user enters their email on
`/forgot-password` → Supabase emails a link → the link hits
`/api/auth/confirm?token_hash=…&type=recovery` → that route exchanges the token
for a session and sends the user to `/reset-password` → they choose a new
password and are signed in.

The link carries a **token hash**, not a PKCE code, so it works when the email
is opened on a *different device* from the one that requested it — a student
asking from a lab PC and opening it on their phone. That is why the email
template must be edited (step 3): the default template uses a link that only
works in the requesting browser.

---

## 1. Redirect allowlist — required, do this first

Supabase → **Authentication → URL Configuration**

- **Site URL:** `https://flightrax.app`
- **Additional Redirect URLs** — add all three:
  - `https://flightrax.app/**` — the user-facing domain
  - `https://flightrax.vercel.app/**` — Vercel's own address, still served alongside it
  - `http://localhost:3001/**` — local development

The app sends `redirectTo = <origin>/api/auth/confirm`, where origin is
whichever deployment the user is on. If that URL is not allowlisted, Supabase
**silently replaces it with the Site URL**. The symptom is an email link that
opens the home page with `?token_hash=…` in the address bar and does nothing.

Local development works against the same hosted project — the localhost entry
is what allows it.

## 2. Email template — required

Supabase → **Authentication → Email Templates → Reset Password**

Replace the body with:

```html
<h2>Reset your FlightraX password</h2>
<p>Someone requested a password reset for this account. If that was you,
follow the link below to choose a new password. It works on any device.</p>
<p><a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery">Reset password</a></p>
<p>If you did not request this, you can ignore this email — your password
has not changed.</p>
```

The important part is the `href`. `{{ .RedirectTo }}` is the URL from step 1
and `{{ .TokenHash }}` is what `/api/auth/confirm` verifies. Do not use
`{{ .ConfirmationURL }}` — that is the single-browser PKCE link.

## 3. SMTP — required for real users

Supabase's built-in sender **only delivers to members of the Supabase
organization's team** — for anyone else `resetPasswordForEmail` fails with
`500 Error sending recovery email`, which the app logs and hides behind the
neutral message. It is unusable for real users, and unusable even for testing
with a normal account. Custom SMTP is required, not optional. (Verified
2026-09-11 by calling `/auth/v1/recover` directly.)

Supabase → **Authentication → SMTP Settings → Enable Custom SMTP**

| Field | Value |
| --- | --- |
| Sender email | an address on your verified domain, e.g. `no-reply@yourdomain` |
| Sender name | `FlightraX` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | your Resend API key |

### Resend needs a domain you control — `flightrax.app`

Resend only delivers to arbitrary recipients from a **verified domain**. The
app's domain is `flightrax.app` (bought 2026-09-11); `flightrax.vercel.app`
could never be verified because Vercel owns that DNS.

1. Resend → **Domains → Add Domain** → `flightrax.app`. Using a subdomain
   such as `mail.flightrax.app` is also fine and keeps the root domain's
   sending reputation separate — either works.
2. Resend shows DNS records to add — typically one **MX**, one **TXT** (SPF),
   and one **TXT** for DKIM. Add them at the registrar or DNS host for
   `flightrax.app`, the same place the Vercel records go.
3. Wait for Resend to show the domain as **Verified** (minutes to an hour).
4. Resend → **API Keys → Create** — a "Sending access" key is enough. This is
   the SMTP password above.
5. Sender email: `no-reply@flightrax.app` (or `@mail.flightrax.app` if you
   verified the subdomain).

Free tier: 3,000 emails/month, 100/day. Password resets will never approach
that.

There is no interim: until Resend is verified and SMTP is configured, reset
emails will not reach anyone who is not on the Supabase org team. Set the DNS
records first and do the SMTP step as soon as the domain shows Verified.

## 4. Check "Confirm email"

Supabase → **Authentication → Providers → Email → Confirm email**

If this is **on**, registration already sends a confirmation email through
whatever SMTP is configured — so the throttled default sender is already in
the registration path, not just resets. Worth knowing before any real signups.

If you keep it on, the same token-hash treatment applies to the **Confirm
signup** template: `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=signup`
— `/api/auth/confirm` already handles `type=signup` and lands the user on
`/dashboard`. Not required for password reset.

---

## Custom domain — what changes and what does not

`flightrax.app` is the user-facing address. `flightrax.vercel.app` keeps
serving the same deployment and stays as the *machine* address:

| Thing | Uses | Change? |
| --- | --- | --- |
| Keep-alive workflow (`APP_URL`) | `flightrax.vercel.app` | **No** — chosen so domain changes never touch it |
| Push dispatch (`private.push_dispatch_config.url`) | `flightrax.vercel.app` | **No** — server-to-server |
| VAPID keys | not domain-bound | **No** |
| Password reset links | whichever origin the user is on | **No code change** — but `flightrax.app` must be allowlisted (step 1) |
| Supabase Site URL | fallback for email links | Set to `https://flightrax.app` |

**Do not enable Vercel's option to redirect `flightrax.vercel.app` to
`flightrax.app`.** `pg_net` does not reliably follow redirects, so push
dispatch would silently stop; and any app installed from the `.vercel.app`
origin would break. If a single canonical domain is wanted later, update the
dispatch row and `APP_URL` to `flightrax.app` first, then add the redirect.

**Installed apps are bound to their origin.** A PWA installed from
`flightrax.vercel.app` has its own service worker and push subscription,
separate from one installed from `flightrax.app`. Pre-launch that only
matters for test devices; from now on, `flightrax.app` is the address to give
people.

## Verifying it end to end

1. Sign out. Go to `/login` → **Forgot password?** → enter your email.
2. The page should say a link is on its way, **whether or not** the email
   exists — the wording is deliberately identical so the form cannot be used
   to discover which emails have accounts.
3. Open the email **on a different device** from the one that requested it.
   That is the case the token-hash template exists for.
4. The link should land on `/reset-password`. If it lands on the home page
   with `token_hash` in the URL, step 1 is wrong. If it lands on
   `/forgot-password` with an *expired* message immediately, step 2 is wrong.
5. Set a new password → you are signed in and on the dashboard (or
   `/pending-approval` for an unapproved account).
6. Sign out and sign in with the new password.

Rate limiting: Supabase caps reset requests per email and per IP. Repeated
tests may hit "Too many reset requests" — that is Supabase, not a bug.

**If the form says the link is on its way but nothing arrives:** check the
dev-server or Vercel logs for `[password-reset] resetPasswordForEmail failed`.
`Error sending recovery email` means SMTP is not configured (or Resend
rejected the sender address). A direct probe of the auth API tells you the
same thing without the app in the way:

```bash
curl -s -X POST "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/recover" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"someone@example.com"}'
```

A `200` with `{}` means Supabase accepted and handed it to the sender.
