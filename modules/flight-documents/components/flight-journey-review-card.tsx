"use client";

import { format } from "date-fns";

import {
  ReviewField,
  ReviewSection,
} from "@/modules/flight-documents/components/flight-request-review-primitives";
import type { FlightJourneyDetails } from "@/modules/flight-documents/types/flight-request";
import { GlassSurface } from "@/shared/components/layout/glass-surface";

function formatMoment(iso: string | null): string {
  return iso ? format(new Date(iso), "MMM d, yyyy · h:mm a") : "—";
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
          {journey.status === "cancelled" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <ReviewField
                label="Cancelled At"
                value={formatMoment(journey.cancelledAt)}
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <ReviewField
                label="Commenced At"
                value={formatMoment(journey.commencedAt)}
              />
              <ReviewField
                label="Terminated At"
                value={formatMoment(journey.terminatedAt)}
              />
              <ReviewField
                label="Flight Duration"
                value={formatDuration(
                  journey.commencedAt,
                  journey.terminatedAt,
                )}
              />
            </div>
          )}
        </ReviewSection>
      ) : (
        <p className="text-sm text-primary-foreground/70">
          No journey has been recorded for this flight plan yet.
        </p>
      )}
    </GlassSurface>
  );
}
