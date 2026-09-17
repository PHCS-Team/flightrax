"use client";

import { useGuardedAction } from "@/shared/hooks/use-guarded-action";

import { verifyPasscodeAction } from "@/shared/lib/passcode-action";

export function useVerifyPasscode() {
  return useGuardedAction(verifyPasscodeAction);
}
