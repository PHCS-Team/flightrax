"use client";

import type { ComponentProps } from "react";
import { useState, useTransition } from "react";
import { LogOutIcon } from "lucide-react";

import { logoutAction } from "@/modules/auth/actions/logout";
import { ConfirmationDialog } from "@/shared/components/layout/confirmation-dialog";
import { Button } from "@/shared/components/ui/button";

type ButtonVariant = NonNullable<ComponentProps<typeof Button>["variant"]>;

export function LogoutConfirmationButton({
  buttonClassName,
  buttonVariant = "outline",
  label = "Logout",
}: {
  buttonClassName?: string;
  buttonVariant?: ButtonVariant;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function confirmLogout() {
    startTransition(() => {
      void logoutAction();
    });
  }

  return (
    <>
      <Button
        className={buttonClassName}
        disabled={isPending}
        onClick={() => setOpen(true)}
        type="button"
        variant={buttonVariant}
      >
        {isPending ? "Logging out..." : label}
      </Button>
      <ConfirmationDialog
        cancelLabel="Stay signed in"
        confirmLabel="Logout"
        confirmingLabel="Logging out..."
        description="You will be signed out and returned to the login page."
        icon={LogOutIcon}
        isConfirming={isPending}
        onConfirm={confirmLogout}
        onOpenChange={setOpen}
        open={open}
        title="Logout of FlightraX?"
      />
    </>
  );
}
