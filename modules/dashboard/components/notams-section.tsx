"use client";

import Autoplay from "embla-carousel-autoplay";
import { format } from "date-fns";
import { Maximize2Icon, MegaphoneIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { useActiveNotams } from "@/modules/dashboard/hooks/use-active-notams.query";
import { useNotamsRealtime } from "@/modules/dashboard/hooks/use-notams-realtime";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/shared/components/ui/carousel";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { NOTAM_SEVERITY_META } from "@/shared/lib/aviation/notam-options";
import { cn } from "@/shared/lib/utils";

// Title-only slides read fast — a short rotation keeps the ticker alive.
const ROTATE_MS = 7000;

const PILL_CLASS =
  "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold";

function TickerStrip({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-y border-primary-foreground/15 bg-primary/60 px-3 py-2 shadow-sm backdrop-blur sm:rounded-2xl sm:border sm:px-4">
      <MegaphoneIcon className="size-4 shrink-0 text-primary-foreground/60" />
      {children}
    </div>
  );
}

export function NotamsSection() {
  const [api, setApi] = useState<CarouselApi>();
  const [listOpen, setListOpen] = useState(false);
  const [autoplay] = useState(() =>
    Autoplay({ delay: ROTATE_MS, stopOnInteraction: false }),
  );
  const { error, isPending, notams } = useActiveNotams();
  useNotamsRealtime();

  useEffect(() => {
    const autoplayPlugin = api?.plugins().autoplay;

    if (!autoplayPlugin) {
      return;
    }

    if (listOpen) {
      autoplayPlugin.stop();
    } else {
      autoplayPlugin.play();
    }
  }, [api, listOpen]);

  if (isPending) {
    return (
      <TickerStrip>
        <p className="truncate text-sm text-primary-foreground/60">
          Loading notices...
        </p>
      </TickerStrip>
    );
  }

  if (error) {
    return (
      <TickerStrip>
        <p className="truncate text-sm text-red-200">
          NOTAMs could not be loaded. {error.message}
        </p>
      </TickerStrip>
    );
  }

  if (notams.length === 0) {
    return (
      <TickerStrip>
        <p className="truncate text-sm text-primary-foreground/70">
          No active NOTAMs. All clear for now.
        </p>
      </TickerStrip>
    );
  }

  return (
    <>
      <TickerStrip>
        <Carousel
          className="min-w-0 flex-1"
          opts={{ loop: true }}
          plugins={[autoplay]}
          setApi={setApi}
        >
          <CarouselContent className="-ml-3">
            {notams.map((notam) => {
              const pill = NOTAM_SEVERITY_META[notam.severity];

              return (
                <CarouselItem className="pl-3" key={notam.id}>
                  <button
                    className="flex w-full min-w-0 cursor-pointer items-center gap-2 text-left"
                    onClick={() => setListOpen(true)}
                    type="button"
                  >
                    <span className={cn(PILL_CLASS, pill.className)}>
                      {pill.label}
                    </span>
                    <span className="truncate text-sm font-medium text-primary-foreground">
                      {notam.title}
                    </span>
                  </button>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
        <button
          aria-label="View All NOTAMs"
          className="shrink-0 cursor-pointer rounded-full p-1 text-primary-foreground/50 transition hover:bg-primary-foreground/10 hover:text-primary-foreground"
          onClick={() => setListOpen(true)}
          type="button"
        >
          <Maximize2Icon className="size-3.5" />
        </button>
      </TickerStrip>

      <Dialog onOpenChange={setListOpen} open={listOpen}>
        <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col p-6 sm:max-w-md">
          <DialogSectionHeader
            description="Notices currently in effect — read before you fly."
            icon={MegaphoneIcon}
            title="Active NOTAMs"
          />
          <div className="-mx-1 mt-1 grid min-h-0 flex-1 gap-3 overflow-y-auto px-1">
            {notams.map((notam) => {
              const pill = NOTAM_SEVERITY_META[notam.severity];

              return (
                <div
                  className="grid gap-1.5 rounded-lg border border-border bg-muted/30 p-3"
                  key={notam.id}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn(PILL_CLASS, pill.className)}>
                      {pill.label}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Posted {format(new Date(notam.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <p className="line-clamp-2 font-semibold leading-snug text-foreground">
                    {notam.title}
                  </p>
                  {notam.description && (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {notam.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Expires {format(new Date(notam.expiresAt), "MMM d, yyyy")}
                  </p>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
