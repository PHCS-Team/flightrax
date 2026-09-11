"use client";

import { useEffect } from "react";

import { MaximizeIcon, MinimizeIcon } from "lucide-react";

import { useMonitorControlsVisible } from "@/modules/monitor/hooks/use-monitor-controls-visible";
import { useMonitorFullscreen } from "@/modules/monitor/hooks/use-monitor-fullscreen";
import { cn } from "@/shared/lib/utils";

export function MonitorFullscreenButton() {
  const { isFullscreen, isSupported, toggle } = useMonitorFullscreen();
  const controlsVisible = useMonitorControlsVisible();

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "f" && event.key !== "F") {
        return;
      }

      event.preventDefault();
      void toggle();
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSupported, toggle]);

  if (!isSupported) {
    return null;
  }

  return (
    <button
      aria-label={isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
      className={cn(
        "fixed left-1/2 top-[2vh] z-50 -translate-x-1/2 inline-flex cursor-pointer items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary/80 px-4 py-2.5 text-sm font-semibold text-primary-foreground backdrop-blur transition-opacity duration-300 hover:bg-primary focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground",
        controlsVisible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      onClick={() => void toggle()}
      type="button"
    >
      {isFullscreen ? (
        <MinimizeIcon className="size-4" />
      ) : (
        <MaximizeIcon className="size-4" />
      )}
      {isFullscreen ? "Exit full screen" : "Full screen"}
      <span className="ml-1 rounded border border-primary-foreground/30 px-1.5 py-0.5 text-[11px] font-medium text-primary-foreground/70">
        F
      </span>
    </button>
  );
}
