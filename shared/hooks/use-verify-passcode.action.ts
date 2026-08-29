"use client";

import { useAction } from "next-safe-action/hooks";

import { verifyPasscodeAction } from "@/shared/lib/passcode-action";

export function useVerifyPasscode() {
  return useAction(verifyPasscodeAction);
}
