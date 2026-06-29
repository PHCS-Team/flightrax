import Link from "next/link";
import type { ReactNode } from "react";
import {
  ActivityIcon,
  CalendarClockIcon,
  GaugeIcon,
  PlaneIcon,
  RadarIcon,
  UsersIcon,
} from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: GaugeIcon },
  { href: "/flights", label: "Flights", icon: PlaneIcon },
  { href: "/scheduling", label: "Scheduling", icon: CalendarClockIcon },
  { href: "/monitoring", label: "Monitoring", icon: RadarIcon },
  { href: "/aircraft", label: "Aircraft", icon: ActivityIcon },
  { href: "/crew", label: "Crew", icon: UsersIcon },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--primary),transparent_86%),transparent_34rem),linear-gradient(135deg,var(--background),var(--muted))]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6">
        <aside className="rounded-3xl border bg-card/85 p-4 shadow-sm backdrop-blur lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-72">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <PlaneIcon className="size-5" />
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-tight">
                FlightRax
              </span>
              <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Ops control
              </span>
            </span>
          </Link>

          <div className="mt-6 rounded-2xl border bg-muted/40 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Network status</span>
              <Badge variant="secondary">Static</Badge>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Supabase wiring is scaffolded; these panels are temporary static
              surfaces until live data is connected.
            </p>
          </div>

          <nav className="mt-6 grid gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <Button
                  key={item.href}
                  asChild
                  variant="ghost"
                  className="justify-start gap-3 rounded-2xl"
                >
                  <Link href={item.href}>
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 pb-8">{children}</main>
      </div>
    </div>
  );
}
