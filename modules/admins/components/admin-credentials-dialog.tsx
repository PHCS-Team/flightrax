"use client";

import {
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import type { AdminCredentials } from "@/modules/admins/types/admin";
import { ConfirmationDialog } from "@/shared/components/layout/confirmation-dialog";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";

function buildHandoffMessage(credentials: AdminCredentials) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";

  return [
    `Hi ${credentials.fullName},`,
    "",
    "Your FlightraX admin account is ready.",
    "",
    `Email: ${credentials.email}`,
    `Temporary password: ${credentials.tempPassword}`,
    "",
    `Sign in at ${origin}/login/admin and change your password right away — the app will ask you to set a new one on your first login.`,
  ].join("\n");
}

export function AdminCredentialsDialog({
  credentials,
  onOpenChange,
  open,
}: {
  credentials: AdminCredentials;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const message = buildHandoffMessage(credentials);

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      toast.success("Message copied. Send it to the new admin.");
    } catch {
      toast.error("Could not copy — select the message text and copy it manually.");
    }
  }

  return (
    <>
    <Dialog
      onOpenChange={(next) => {
        if (!next) {
          setConfirmClose(true);
        }
      }}
      open={open}
    >
      <DialogContent
        className="p-6 sm:max-w-lg"
        onEscapeKeyDown={(event) => {
          event.preventDefault();
          setConfirmClose(true);
        }}
        onInteractOutside={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogSectionHeader
          description="This temporary password is shown only now — copy the message below before closing."
          icon={KeyRoundIcon}
          title="Temporary Admin Credentials"
        />

        <div className="grid gap-4">
          <div className="grid gap-2">
            <p className="text-sm font-semibold text-foreground">Email</p>
            <Input readOnly value={credentials.email} />
          </div>

          <div className="grid gap-2">
            <p className="text-sm font-semibold text-foreground">
              Temporary Password
            </p>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                type={revealed ? "text" : "password"}
                value={credentials.tempPassword}
              />
              <Button
                aria-label={revealed ? "Hide password" : "Show password"}
                className="h-9 w-9 shrink-0 p-0 md:h-10 md:w-10"
                onClick={() => setRevealed((current) => !current)}
                type="button"
                variant="outline"
              >
                {revealed ? (
                  <EyeOffIcon className="size-4" />
                ) : (
                  <EyeIcon className="size-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">
                Message For The New Admin
              </p>
              <Button
                aria-label="Copy message"
                className="h-8 gap-1.5 px-2.5 text-xs"
                onClick={copyMessage}
                size="sm"
                type="button"
                variant="outline"
              >
                <CopyIcon className="size-3.5" />
                Copy
              </Button>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-sm whitespace-pre-wrap break-words text-foreground">
                {message}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button
            onClick={() => setConfirmClose(true)}
            type="button"
            variant="outline"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <ConfirmationDialog
      confirmLabel="Close anyway"
      confirmVariant="default"
      confirmingLabel="Closing..."
      description="This temporary password cannot be viewed again after closing. Make sure you have copied the message and sent it to the new admin — otherwise you will have to regenerate the password."
      icon={TriangleAlertIcon}
      isConfirming={false}
      onConfirm={() => {
        setConfirmClose(false);
        onOpenChange(false);
      }}
      onOpenChange={setConfirmClose}
      open={confirmClose}
      title="Password Will Not Be Shown Again"
    />
    </>
  );
}
