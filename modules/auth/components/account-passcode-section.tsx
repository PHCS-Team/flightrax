"use client";

import { LockIcon } from "lucide-react";
import { useState } from "react";

import { PasswordInput } from "@/modules/auth/components/password-input";
import { useSavePasscode } from "@/modules/auth/hooks/use-save-passcode.action";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { Button } from "@/shared/components/ui/button";

export function AccountPasscodeSection({
  passcodeHash,
}: {
  passcodeHash: string | null | undefined;
}) {
  const hasPasscode = Boolean(passcodeHash);
  const [isChanging, setIsChanging] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const { executeAsync, isExecuting } = useSavePasscode();

  function resetForm() {
    setCurrentPassword("");
    setPasscode("");
    setConfirmPasscode("");
    setIsChanging(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (passcode !== confirmPasscode) return;
    const result = await executeAsync(
      hasPasscode ? { currentPassword, passcode } : { passcode },
    );
    if (result?.data?.ok) {
      resetForm();
    }
  }

  const isSetup = !hasPasscode;
  const isFormValid = isSetup
    ? passcode.length === 4
    : currentPassword.length > 0 &&
      passcode.length === 4 &&
      passcode === confirmPasscode;
  const mismatch = confirmPasscode.length > 0 && passcode !== confirmPasscode;

  return (
    <GlassSurface className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground">
          <LockIcon className="size-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-primary-foreground">
            Approval passcode
          </h2>
          <p className="mt-0.5 text-sm text-primary-foreground/70">
            {isSetup
              ? "Set a 4-digit passcode required when approving flight plans."
              : isChanging
                ? "Enter your account password to change your passcode."
                : "Passcode is currently set."}
          </p>
        </div>
      </div>

      {!hasPasscode || isChanging ? (
        <form className="space-y-4" onSubmit={handleSubmit}>
          {hasPasscode && (
            <div className="grid gap-2">
              <label
                className="text-sm font-semibold text-primary-foreground/90"
                htmlFor="account-current-password"
              >
                Enter Your Password
              </label>
              <PasswordInput
                id="account-current-password"
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your account password"
                value={currentPassword}
              />
            </div>
          )}
          <div className="grid gap-2">
            <label
              className="text-sm font-semibold text-primary-foreground/90"
              htmlFor="account-passcode"
            >
              {isSetup ? "Passcode" : "New Passcode"}
            </label>
            <PasswordInput
              className="text-center text-lg font-mono tracking-[0.3em]"
              id="account-passcode"
              inputMode="numeric"
              maxLength={4}
              onChange={(e) =>
                setPasscode(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="••••"
              value={passcode}
            />
          </div>
          <div className="grid gap-2">
            <label
              className="text-sm font-semibold text-primary-foreground/90"
              htmlFor="account-passcode-confirm"
            >
              {isSetup ? "Confirm Passcode" : "Confirm New Passcode"}
            </label>
            <PasswordInput
              className="text-center text-lg font-mono tracking-[0.3em]"
              id="account-passcode-confirm"
              inputMode="numeric"
              maxLength={4}
              onChange={(e) =>
                setConfirmPasscode(
                  e.target.value.replace(/\D/g, "").slice(0, 4),
                )
              }
              placeholder="••••"
              value={confirmPasscode}
            />
          </div>
          {mismatch && (
            <p className="text-sm text-destructive">Passcodes do not match.</p>
          )}
          <div className="flex gap-3">
            {hasPasscode && (
              <Button
                className="flex-1"
                disabled={isExecuting}
                onClick={resetForm}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
            )}
            <Button
              className={hasPasscode ? "flex-1" : "w-full"}
              disabled={isExecuting || !isFormValid}
              type="submit"
            >
              {isExecuting ? "Saving..." : "Save passcode"}
            </Button>
          </div>
        </form>
      ) : (
        <Button
          className="w-full"
          onClick={() => setIsChanging(true)}
          type="button"
          variant="outline"
        >
          Change passcode
        </Button>
      )}
    </GlassSurface>
  );
}
