import Link from "next/link";

import { Button } from "@/shared/components/ui/button";
import { FlightRaxBackground } from "@/shared/components/layout/flightrax-background";
import { SuperadminSecretTrigger } from "@/modules/dashboard/components/superadmin-secret-trigger";

export function HomePage() {
  return (
    <FlightRaxBackground className="min-h-dvh px-0 py-0 sm:px-6 sm:py-8">
      <main className="mx-auto grid min-h-dvh w-full max-w-7xl items-center gap-14 px-6 py-12 text-primary-foreground md:px-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(20rem,0.55fr)] lg:gap-16 lg:py-24">
        <section className="mx-auto flex max-w-4xl flex-col items-center text-center lg:mx-0 lg:items-start lg:text-left">
          <SuperadminSecretTrigger />

          <p className="mt-3 sm:mt-10 mb-64 sm:mb-0 text-sm font-semibold uppercase tracking-[0.3em] text-primary-foreground/70 sm:block lg:mt-12">
            Flight Operations & Training Management
          </p>
          <h1 className="mt-3 hidden max-w-3xl text-4xl font-medium leading-[0.95] tracking-tight text-primary-foreground sm:text-5xl sm:block md:text-7xl md:font-semibold">
            Hello Aviator!
          </h1>
          <p className="mt-16 mb-8 hidden max-w-2xl text-lg leading-8 text-primary-foreground/82 sm:block md:text-xl md:leading-9">
            FlightraX is WCC&apos;s web-based system for automated flight
            scheduling, digital permission routing, public flight tracking
            monitors, and role-based approvals for students and flight
            instructors.
          </p>

          <div className="flex w-full flex-col gap-4 sm:gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-lg bg-primary-foreground px-7 font-bold uppercase text-primary hover:bg-primary-foreground/90 sm:rounded-2xl"
            >
              <Link href="/login">Sign In</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 rounded-lg border-primary-foreground/25 bg-primary-foreground/10 px-7 font-bold uppercase text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground sm:rounded-2xl"
            >
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </section>

        <aside className="hidden space-y-5 border-t-2 border-primary-foreground/15 pt-8 lg:block lg:border-l-2 lg:border-t-0 lg:pl-10 lg:pt-0">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-foreground/65">
            Built for WCC
          </p>
          <div className="grid gap-5 text-primary-foreground">
            <div>
              <p className="text-2xl font-semibold tracking-tight">Schedule</p>
              <p className="mt-2 text-sm leading-6 text-primary-foreground/70">
                Automate flight schedules and keep training operations aligned.
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight">Route</p>
              <p className="mt-2 text-sm leading-6 text-primary-foreground/70">
                Move permissions through the right student and instructor lanes.
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight">Track</p>
              <p className="mt-2 text-sm leading-6 text-primary-foreground/70">
                Surface public flight tracking monitors for operational clarity.
              </p>
            </div>
          </div>
        </aside>
      </main>
    </FlightRaxBackground>
  );
}
