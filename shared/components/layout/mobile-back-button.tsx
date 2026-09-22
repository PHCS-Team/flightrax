"use client";

import { ChevronLeftIcon } from "lucide-react";

import { useBackNavigation } from "@/shared/hooks/use-back-navigation";

export function MobileBackButton({ fallbackHref }: { fallbackHref: string }) {
  const goBack = useBackNavigation(fallbackHref);

  return (
    <button
      aria-label="Go back"
      className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground transition active:bg-primary-foreground/20 sm:hidden"
      onClick={goBack}
      type="button"
    >
      <ChevronLeftIcon className="size-5" />
    </button>
  );
}
