import Link from "next/link";
import { ArrowRightIcon, PlaneTakeoffIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { FlightRaxBackground } from "@/shared/components/layout/flightrax-background";

export function HomePage() {
  return (
    <FlightRaxBackground className="min-h-screen px-6 py-10">
      <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-center rounded-[2rem] border bg-card/85 p-8 text-card-foreground shadow-sm backdrop-blur md:p-12">
        <div className="max-w-3xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-2 text-sm text-muted-foreground">
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
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      </main>
    </FlightRaxBackground>
  );
}
