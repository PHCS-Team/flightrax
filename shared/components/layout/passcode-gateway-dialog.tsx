"use client";

import { LockIcon } from "lucide-react";
import { useState } from "react";

import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";

// Security gateway for sensitive actions: the user must enter their
// 4-digit profile passcode before the caller proceeds. The caller
// supplies the server check via `verify`; the action performed after
// the gateway must re-verify the passcode server-side — this dialog is
// UX, not enforcement.
export function PasscodeGatewayDialog({
  description = "Enter your 4-digit security passcode to continue.",
  isVerifying,
  onOpenChange,
  onVerified,
  open,
  verify,
}: {
  description?: string;
  isVerifying: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: (passcode: string) => void;
  open: boolean;
  verify: (
    passcode: string,
  ) => Promise<{ ok: boolean; message: string } | undefined>;
}) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setPasscode("");
      setError(null);
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (passcode.length !== 4 || isVerifying) {
      return;
    }

    setError(null);
    const result = await verify(passcode);

    if (result?.ok) {
      setPasscode("");
      onVerified(passcode);

      return;
    }

    setError(result?.message ?? "Passcode could not be verified.");
    setPasscode("");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] p-6 sm:w-full sm:max-w-sm">
        <DialogSectionHeader
          description={description}
          icon={LockIcon}
          title="Enter Passcode"
        />
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <Input
            autoComplete="one-time-code"
            autoFocus
            className="border-border bg-muted/30 text-center text-xl tracking-[0.5em] text-[#121212] placeholder:tracking-normal placeholder:text-muted-foreground/55"
            inputMode="numeric"
            maxLength={4}
            onChange={(event) =>
              setPasscode(event.target.value.replace(/\D/g, "").slice(0, 4))
            }
            placeholder="••••"
            type="password"
            value={passcode}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="-mx-6 -mb-6 mt-2 sm:justify-end">
            <Button
              disabled={isVerifying}
              onClick={() => handleOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={passcode.length !== 4 || isVerifying}
              type="submit"
            >
              {isVerifying ? "Verifying..." : "Confirm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
