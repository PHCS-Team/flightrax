import "server-only";

import { scryptSync, timingSafeEqual } from "node:crypto";

import { createAdminClient } from "@/shared/lib/supabase/admin";

export function verifyPasscodeHash(
  stored: string | null,
  passcode: string,
): boolean {
  if (!stored) {
    return false;
  }

  const [salt, hash] = stored.split(":");

  if (!salt || !hash) {
    return false;
  }

  const candidate = scryptSync(passcode, salt, 64);
  const expected = Buffer.from(hash, "hex");

  return (
    expected.length === candidate.length && timingSafeEqual(candidate, expected)
  );
}

export async function verifyProfilePasscode(
  profileId: string,
  passcode: string,
): Promise<{ ok: boolean; message: string }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("passcode_hash")
    .eq("id", profileId)
    .maybeSingle();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!data?.passcode_hash) {
    return {
      ok: false,
      message: "Set your security passcode in account settings first.",
    };
  }

  if (!verifyPasscodeHash(data.passcode_hash, passcode)) {
    return { ok: false, message: "Incorrect passcode." };
  }

  return { ok: true, message: "Passcode verified." };
}
