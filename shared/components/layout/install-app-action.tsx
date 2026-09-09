"use client";

import { useState } from "react";

import { DownloadIcon } from "lucide-react";

import { InstallAppDialog } from "@/shared/components/layout/install-app-dialog";
import { Button } from "@/shared/components/ui/button";
import { useInstallApp } from "@/shared/hooks/use-install-app";

export function InstallAppAction() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { canPromptDirectly, install, isIos, isStandalone } = useInstallApp();

  if (isStandalone) {
    return null;
  }

  const onInstall = () => {
    if (canPromptDirectly) {
      void install();

      return;
    }

    setDialogOpen(true);
  };

  return (
    <>
      <Button
        className="mt-3 w-full cursor-pointer justify-start gap-2 border border-primary-foreground/20 bg-primary-foreground/10 text-xs font-semibold text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
        onClick={onInstall}
        size="sm"
        type="button"
        variant="ghost"
      >
        <DownloadIcon className="size-3.5" />
        Install app
      </Button>

      <InstallAppDialog
        isIos={isIos}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
      />
    </>
  );
}
