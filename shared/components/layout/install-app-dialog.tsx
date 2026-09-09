"use client";

import { MoreVerticalIcon, Share2Icon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

const IOS_STEPS = [
  "Tap the Share button in the Safari toolbar.",
  "Scroll down and choose Add to Home Screen.",
  "Tap Add, then open FlightraX from your home screen.",
];

const BROWSER_STEPS = [
  "Open the browser menu (the three dots).",
  "Choose Install app, or Add to Home screen.",
  "Confirm Install, then open FlightraX from your home screen.",
];

export function InstallAppDialog({
  isIos,
  onOpenChange,
  open,
}: {
  isIos: boolean;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const steps = isIos ? IOS_STEPS : BROWSER_STEPS;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3.5">
            <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
              {isIos ? (
                <Share2Icon className="size-4.5" />
              ) : (
                <MoreVerticalIcon className="size-4.5" />
              )}
            </span>
            <div className="min-w-0 text-left">
              <DialogTitle className="text-lg font-semibold leading-6 tracking-tight text-foreground">
                {isIos ? "Install on iPhone or iPad" : "Install FlightraX"}
              </DialogTitle>
              <DialogDescription className="leading-6 text-muted-foreground">
                {isIos
                  ? "Safari cannot install apps automatically, so this takes three taps."
                  : "Your browser did not offer an install button, so add it from the menu."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ol className="mt-1 space-y-3">
          {steps.map((step, index) => (
            <li className="flex items-start gap-3" key={step}>
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                {index + 1}
              </span>
              <span className="text-sm leading-6 text-foreground">{step}</span>
            </li>
          ))}
        </ol>

        {isIos && (
          <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs leading-5 text-muted-foreground">
            It must be Safari — other browsers on iOS cannot add to the home
            screen. Notifications only work once FlightraX is opened from the
            home screen icon.
          </p>
        )}

        <DialogFooter>
          <Button
            className="cursor-pointer"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
