import Link from "next/link";
import { ArrowRightIcon, PlaneTakeoffIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

export function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklch,var(--primary),transparent_84%),transparent_32rem),linear-gradient(135deg,var(--background),var(--muted))] px-6 py-10">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-center rounded-[2rem] border bg-card/80 p-8 shadow-sm backdrop-blur md:p-12">
        <div className="max-w-3xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm text-muted-foreground">
            <PlaneTakeoffIcon className="size-4" />
            Flight operations command center
          </div>
          <h1 className="text-5xl font-semibold tracking-tight text-foreground md:text-7xl">
            Coordinate aircraft, crew, and schedules from one calm surface.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            FlightRax is being scaffolded for Supabase-backed auth, database,
            storage, and realtime operations. The current screens are static
            placeholders for the final product flow.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Open dashboard
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign in preview</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
