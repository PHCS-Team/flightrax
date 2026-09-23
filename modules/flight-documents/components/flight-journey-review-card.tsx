"use client";

import { format } from "date-fns";

import { ReviewSection } from "@/modules/flight-documents/components/flight-request-review-primitives";
import type { FlightJourneyDetails } from "@/modules/flight-documents/types/flight-request";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { CLOCK_TIME_PATTERN } from "@/shared/lib/clock-time";

function formatMoment(iso: string | null): string {
  return iso
    ? format(new Date(iso), `MMM d, yyyy · ${CLOCK_TIME_PATTERN}`)
    : "—";
}

function formatDuration(
  commencedAt: string | null,
  terminatedAt: string | null,
): string {
  if (!commencedAt || !terminatedAt) {
    return "—";
  }

  const totalMinutes = Math.max(
    0,
    Math.floor(
      (new Date(terminatedAt).getTime() - new Date(commencedAt).getTime()) /
        60000,
    ),
  );

  return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
}

// Names keep their stored capitalisation: the form fields above are
// uppercase by ICAO convention, but a name and timestamp in all caps is
// hard to read.
function ActionField({
  at,
  byLine,
  label,
}: {
  at: string | null;
  byLine?: string | null;
  label: string;
}) {
  return (
    <div className="grid content-start gap-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="min-w-0 rounded-lg border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-2 sm:rounded-2xl">
        <p className="text-sm text-primary-foreground">{formatMoment(at)}</p>
        {at && byLine && (
          <p className="mt-0.5 wrap-break-word text-xs text-primary-foreground/70">
            {byLine}
          </p>
        )}
      </div>
    </div>
  );
}

// Read-only display of the flight's lifecycle record.
export function FlightJourneyReviewCard({
  journey,
}: {
  journey: FlightJourneyDetails | null;
}) {
  return (
    <GlassSurface className="grid gap-6 p-4 sm:p-6">
      {journey ? (
        <ReviewSection title="Lifecycle">
          <div className="grid gap-4 sm:grid-cols-2">
            <ActionField
              at={journey.approvedAt}
              byLine={
                journey.approvedByName ? `by ${journey.approvedByName}` : null
              }
              label="Approved"
            />
            {journey.status === "cancelled" ? (
              <ActionField
                at={journey.cancelledAt}
                byLine={
                  journey.cancelledByName
                    ? `by ${journey.cancelledByName}`
                    : "Cancelled automatically — no-show"
                }
                label="Cancelled"
              />
            ) : (
              <>
                <ActionField
                  at={journey.commencedAt}
                  byLine={
                    journey.commencedByName
                      ? `by ${journey.commencedByName}`
                      : null
                  }
                  label="Commenced"
                />
                <ActionField
                  at={journey.terminatedAt}
                  byLine={
                    journey.terminatedByName
                      ? `by ${journey.terminatedByName}`
                      : null
                  }
                  label="Terminated"
                />
                <div className="grid content-start gap-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Flight Duration
                  </p>
                  <div className="min-w-0 rounded-lg border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-2 sm:rounded-2xl">
                    <p className="text-sm text-primary-foreground">
                      {formatDuration(
                        journey.commencedAt,
                        journey.terminatedAt,
                      )}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </ReviewSection>
      ) : (
        <p className="text-sm text-primary-foreground/70">
          No journey has been recorded for this flight plan yet.
        </p>
      )}
    </GlassSurface>
  );
}
