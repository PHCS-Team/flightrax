"use client";

import Image from "next/image";

import type { MonitorNotam } from "@/modules/monitor/types/monitor";
import { NOTAM_SEVERITY_META } from "@/shared/lib/aviation/notam-options";
import { cn } from "@/shared/lib/utils";

export function MonitorNotamBand({
  activeIndex,
  notams,
}: {
  activeIndex: number;
  notams: MonitorNotam[];
}) {
  const notam = notams[activeIndex] ?? null;

  return (
    <footer className="grid grid-cols-[minmax(0,1fr)_auto_15vw] items-center gap-[2.5vw] bg-primary-foreground px-[3vw] py-[1.2vh] text-primary">
      {notam ? (
        <div
          className="min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-1000 ease-out"
          key={notam.id}
        >
          <div className="flex items-center gap-[1vw]">
            <span
              className={cn(
                "inline-flex shrink-0 items-center rounded-full border px-[0.8vw] py-[0.3vh] text-[min(1vw,1.7vh)] font-semibold uppercase tracking-wider",
                NOTAM_SEVERITY_META[notam.severity].className,
              )}
            >
              {NOTAM_SEVERITY_META[notam.severity].label}
            </span>
            <p className="min-w-0 truncate text-[min(1.7vw,2.9vh)] font-semibold leading-snug">
              {notam.title}
            </p>
            <p className="ml-auto shrink-0 font-mono text-[min(1.1vw,1.9vh)] tabular-nums text-primary/60">
              NOTAM {activeIndex + 1}/{notams.length}
            </p>
          </div>
          {notam.description && (
            <p className="mt-[0.8vh] whitespace-pre-wrap text-[min(1.4vw,2.4vh)] leading-snug text-primary/90">
              {notam.description}
            </p>
          )}
        </div>
      ) : (
        <p className="text-[min(1.6vw,2.7vh)] font-medium text-primary/60">
          No active NOTAMs
        </p>
      )}

      <span
        aria-hidden
        className="h-[9vh] w-px bg-linear-to-b from-transparent via-primary/30 to-transparent"
      />

      <div className="flex justify-end py-[1vh] pl-[1vw]">
        <div className="relative h-[9vh] w-[14vw]">
          <Image
            alt="FlightraX"
            className="object-contain object-right"
            fill
            priority
            sizes="14vw"
            src="/logo/flightrax.png"
          />
        </div>
      </div>
    </footer>
  );
}
