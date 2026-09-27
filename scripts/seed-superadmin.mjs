// Ensures the superadmin account exists (create-or-reset, safe to
// re-run). New databases get flightraxteam@gmail.com with the
// default password and must_change_password set, so the app forces a
// password change on first login. If the account already exists, its
// password is reset to the default and the forced-change flag is set
// again — re-running the seeder doubles as superadmin recovery.
//
// Usage: npm run seed:superadmin
// Env:   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//        (read from the environment, falling back to .env.local)
//        SEED_SUPERADMIN_EMAIL / SEED_SUPERADMIN_PASSWORD override defaults.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const DEFAULT_EMAIL = "flightraxteam@gmail.com";
const DEFAULT_PASSWORD = "root1234";
const DEFAULT_FULL_NAME = "FlightraX Superadmin";

function envFromDotenv(name) {
  try {
    const line = readFileSync(".env.local", "utf8")
      .split("\n")
      .find((entry) => entry.startsWith(`${name}=`));

    return line ? line.slice(name.length + 1).trim() : undefined;
  } catch {
    return undefined;
  }
}

function env(name) {
  return process.env[name] || envFromDotenv(name);
}

const url = env("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

const email = env("SEED_SUPERADMIN_EMAIL") || DEFAULT_EMAIL;
const password = env("SEED_SUPERADMIN_PASSWORD") || DEFAULT_PASSWORD;
const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

const { data: existing, error: lookupError } = await supabase
  .from("profiles")
  .select("id, role")
  .eq("email", email)
  .maybeSingle();

if (lookupError) {
  console.error("Could not check for an existing account:", lookupError.message);
  process.exit(1);
}

if (existing) {
  const { error: resetError } = await supabase.auth.admin.updateUserById(
    existing.id,
    { password },
  );

  if (resetError) {
    console.error("Could not reset the password:", resetError.message);
    process.exit(1);
  }

  const { error: flagError } = await supabase
    .from("profiles")
    .update({ must_change_password: true })
    .eq("id", existing.id);

  if (flagError) {
    console.error(
      "Password reset, but the password-change flag could not be set:",
      flagError.message,
    );
    process.exit(1);
  }

  console.log(
    `${email} already exists (role: ${existing.role}) — password reset to the default. The app will require changing it on next login.`,
  );
  process.exit(0);
}

const { data: created, error: createError } =
  await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: DEFAULT_FULL_NAME,
      requested_role: "superadmin",
      admin_department: "",
    },
  });

if (createError) {
  if (/already|exists|registered/i.test(createError.message)) {
    console.log(`${email} already exists in auth — nothing to do.`);
    process.exit(0);
  }

  console.error("Could not create the superadmin:", createError.message);
  process.exit(1);
}

const { error: flagError } = await supabase
  .from("profiles")
  .update({ must_change_password: true })
  .eq("id", created.user.id);

if (flagError) {
  console.error(
    "Account created, but the password-change flag could not be set:",
    flagError.message,
  );
  process.exit(1);
}

console.log(
  `Created ${email} (superadmin, approved). Default password is set — the app will require changing it on first login.`,
);
