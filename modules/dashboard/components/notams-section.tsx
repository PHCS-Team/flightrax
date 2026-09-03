"use client";

import Autoplay from "embla-carousel-autoplay";
import { format } from "date-fns";
import { Maximize2Icon, MegaphoneIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/shared/components/ui/carousel";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { cn } from "@/shared/lib/utils";

// TODO(notams): once the NOTAMs CRUD ships, replace DUMMY_NOTAMS with a
// realtime TanStack Query hook (fetch non-expired notams sorted by
// created_at desc through the standard chain, invalidated by a notams
// realtime subscription) and lift this type to shared/ — the dashboard
// must not import from modules/notams (Rule 3).
type DashboardNotam = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  severity: "advisory" | "warning" | "alert";
  expiresAt: string | null;
  createdAt: string;
};

const DUMMY_NOTAMS: DashboardNotam[] = [
  {
    id: "n1",
    title: "Runway 03/21 Closed For Repainting",
    description:
      "Runway 03/21 is closed daily from 1300Z to 2100Z until further notice for centerline repainting. Expect taxiway Bravo to be used for repositioning. Coordinate with ground before startup.",
    category: "aerodrome",
    severity: "warning",
    expiresAt: "2026-09-20T00:00:00Z",
    createdAt: "2026-08-29T02:10:00Z",
  },
  {
    id: "n2",
    title: "Bird Activity Reported Near Threshold",
    description:
      "Increased bird activity reported within the vicinity of the runway threshold during early morning hours. Exercise caution on departure and arrival between 2100Z and 0000Z.",
    category: "hazard",
    severity: "alert",
    expiresAt: null,
    createdAt: "2026-08-28T21:45:00Z",
  },
  {
    id: "n3",
    title: "Fuel Delivery Delayed",
    description:
      "AVGAS delivery is delayed until next week. Plan fuel loads accordingly and confirm availability with operations before filing.",
    category: "operations",
    severity: "advisory",
    expiresAt: "2026-09-07T00:00:00Z",
    createdAt: "2026-08-27T08:00:00Z",
  },
  {
    id: "n4",
    title: "Tower Frequency Change",
    description:
      "Tower primary frequency changes to 118.35 MHz effective immediately. Update your kneeboards and briefings.",
    category: "communications",
    severity: "advisory",
    expiresAt: null,
    createdAt: "2026-08-25T13:30:00Z",
  },
  {
    id: "n6",
    title:
      "Temporary Restricted Area Established Over Binalonan Training Sector Due To Scheduled Military Exercises Until Further Notice",
    description:
      "A temporary restricted area is established over the Binalonan training sector from surface to 6,000 ft due to scheduled military exercises. All training flights must coordinate routing with operations before filing. Expect reroutes via the coastal corridor.",
    category: "airspace",
    severity: "warning",
    expiresAt: "2026-09-15T00:00:00Z",
    createdAt: "2026-08-30T06:00:00Z",
  },
  {
    id: "n5",
    title: "Drone Activity West Of Field",
    description:
      "Unauthorized drone activity observed approximately 2 NM west of the field below 1,500 ft. Report sightings to the tower.",
    category: "hazard",
    severity: "warning",
    expiresAt: "2026-08-15T00:00:00Z",
    createdAt: "2026-08-10T09:00:00Z",
  },
];

// Title-only slides read fast — a short rotation keeps the ticker alive.
const ROTATE_MS = 7000;

// Non-expired first, newest first — evaluated once at module load. The
// future query hook replaces this with server-side filtering/sorting.
const ACTIVE_NOTAMS = DUMMY_NOTAMS.filter(
  (notam) =>
    !notam.expiresAt || new Date(notam.expiresAt).getTime() > Date.now(),
).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

const SEVERITY_PILLS: Record<
  DashboardNotam["severity"],
  { label: string; className: string }
> = {
  // Sky blue stays readable on the dark glass strip AND the white
  // dialog — a primary-foreground pill disappears on the latter.
  advisory: {
    label: "Advisory",
    className: "border-sky-200/50 bg-sky-600/80 text-white",
  },
  warning: {
    label: "Warning",
    className: "border-orange-200/50 bg-orange-500/80 text-white",
  },
  alert: {
    label: "Alert",
    className: "border-red-200/40 bg-red-700/70 text-red-50",
  },
};

// Slim announcement ticker: one line, auto-rotating. Its only job is
// ambient awareness — clicking anywhere on it opens the full scrollable
// list of active NOTAMs, so no arrows, dots, or counters are needed.
export function NotamsSection() {
  const [api, setApi] = useState<CarouselApi>();
  const [listOpen, setListOpen] = useState(false);
  const [autoplay] = useState(() =>
    Autoplay({ delay: ROTATE_MS, stopOnInteraction: false }),
  );

  const notams = ACTIVE_NOTAMS;

  // Reading the list shouldn't race the rotation. The plugin is reached
  // through the api so it is never touched before embla initializes it.
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

  if (notams.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2 border-y border-primary-foreground/15 bg-primary/60 px-3 py-2 shadow-sm backdrop-blur sm:rounded-2xl sm:border sm:px-4">
        <MegaphoneIcon className="size-4 shrink-0 text-primary-foreground/60" />
        <Carousel
          className="min-w-0 flex-1"
          opts={{ loop: true }}
          plugins={[autoplay]}
          setApi={setApi}
        >
          <CarouselContent className="-ml-3">
            {notams.map((notam) => {
              const pill = SEVERITY_PILLS[notam.severity];

              return (
                <CarouselItem className="pl-3" key={notam.id}>
                  <button
                    className="flex w-full min-w-0 cursor-pointer items-center gap-2 text-left"
                    onClick={() => setListOpen(true)}
                    type="button"
                  >
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                        pill.className,
                      )}
                    >
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
      </div>

      <Dialog onOpenChange={setListOpen} open={listOpen}>
        <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col p-6 sm:max-w-md">
          <DialogSectionHeader
            description="Notices currently in effect — read before you fly."
            icon={MegaphoneIcon}
            title="Active NOTAMs"
          />
          <div className="-mx-1 mt-1 grid min-h-0 flex-1 gap-3 overflow-y-auto px-1">
            {notams.map((notam) => {
              const pill = SEVERITY_PILLS[notam.severity];

              return (
                <div
                  className="grid gap-1.5 rounded-lg border border-border bg-muted/30 p-3"
                  key={notam.id}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                        pill.className,
                      )}
                    >
                      {pill.label}
                    </span>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {notam.category}
                    </p>
                  </div>
                  <p className="font-semibold leading-snug text-foreground">
                    {notam.title}
                  </p>
                  {notam.description && (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {notam.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Posted {format(new Date(notam.createdAt), "MMM d, yyyy")}
                    {notam.expiresAt &&
                      ` · Expires ${format(new Date(notam.expiresAt), "MMM d, yyyy")}`}
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
