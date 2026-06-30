"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { motion, type Variants } from "motion/react";
import {
  ActivityIcon,
  BellIcon,
  CalendarClockIcon,
  GaugeIcon,
  MenuIcon,
  PlaneIcon,
  RadarIcon,
  UserCheckIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { FlightRaxBackground } from "@/shared/components/layout/flightrax-background";
import { getAvatarFallback } from "@/shared/lib/avatar-fallback";
import type { Profile } from "@/shared/lib/rbac/types";
import { cn } from "@/shared/lib/utils";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: GaugeIcon },
  { href: "/flights", label: "Flights", icon: PlaneIcon },
  { href: "/scheduling", label: "Scheduling", icon: CalendarClockIcon },
  { href: "/monitoring", label: "Monitoring", icon: RadarIcon },
  { href: "/aircraft", label: "Aircraft", icon: ActivityIcon },
  { href: "/crew", label: "Crew", icon: UsersIcon },
  { href: "/student-review", label: "Student review", icon: UserCheckIcon },
];

const copyTransition = {
  duration: 0.12,
  ease: "easeOut",
} as const;

const sidebarCopyVariants = {
  expanded: {
    opacity: 1,
    x: 0,
    transition: copyTransition,
  },
  collapsed: {
    opacity: 0,
    x: -8,
    transition: copyTransition,
  },
} satisfies Variants;

function NetworkStatusCard() {
  return (
    <div className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 p-3 text-primary-foreground">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Network status</span>
        <Badge variant="secondary">Static</Badge>
      </div>
      <p className="mt-2 text-sm leading-6 text-primary-foreground/75">
        Supabase wiring is scaffolded; these panels are temporary static
        surfaces until live data is connected.
      </p>
    </div>
  );
}

export function DashboardShell({
  children,
  profile,
}: {
  children: ReactNode;
  profile: Profile | null;
}) {
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <FlightRaxBackground className="min-h-screen">
      {mobileOpen && (
        <button
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-primary/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          type="button"
        />
      )}

      <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-6 px-4 pb-4 lg:px-6 lg:py-4">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-primary-foreground/15 bg-primary p-4 text-primary-foreground shadow-xl transition-transform duration-200 lg:sticky lg:top-4 lg:z-auto lg:h-[calc(100vh-2rem)] lg:rounded-3xl lg:border lg:bg-primary/95 lg:backdrop-blur lg:transition-[width,padding] lg:duration-200 lg:ease-out lg:translate-x-0 lg:shadow-sm",
            mobileOpen ? "translate-x-0" : "-translate-x-[calc(100%+2rem)]",
            desktopCollapsed && "lg:w-20 lg:px-3",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3",
              desktopCollapsed && "lg:justify-center",
            )}
          >
            <Link
              href="/dashboard"
              className={cn(
                "flex min-w-0 flex-1 items-center gap-3",
                desktopCollapsed && "lg:flex-none lg:gap-0",
              )}
              onClick={() => setMobileOpen(false)}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground shadow-sm">
                <PlaneIcon className="size-5" />
              </span>
              <span className="min-w-0 lg:hidden">
                <span className="block text-lg font-semibold tracking-tight">
                  FlightRax
                </span>
                <span className="text-xs uppercase tracking-[0.24em] text-primary-foreground/70">
                  Ops control
                </span>
              </span>
              <motion.span
                animate={desktopCollapsed ? "collapsed" : "expanded"}
                aria-hidden={desktopCollapsed}
                className={cn(
                  "hidden min-w-0 overflow-hidden whitespace-nowrap lg:block",
                  desktopCollapsed ? "lg:w-0" : "lg:w-auto",
                )}
                initial={false}
                variants={sidebarCopyVariants}
              >
                <span className="block text-lg font-semibold tracking-tight">
                  FlightRax
                </span>
                <span className="text-xs uppercase tracking-[0.24em] text-primary-foreground/70">
                  Ops control
                </span>
              </motion.span>
            </Link>
            <button
              aria-label="Close sidebar"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground/80 lg:hidden"
              onClick={() => setMobileOpen(false)}
              type="button"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          <div className="mt-6 flex min-h-0 flex-1 flex-col gap-6">
            <nav className="grid gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Button
                    key={item.href}
                    asChild
                    title={desktopCollapsed ? item.label : undefined}
                    variant="ghost"
                    className={cn(
                      "justify-start gap-3 rounded-2xl text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground aria-expanded:bg-primary-foreground/10 aria-expanded:text-primary-foreground",
                      desktopCollapsed && "lg:justify-center lg:gap-0 lg:px-0",
                    )}
                  >
                    <Link href={item.href} onClick={() => setMobileOpen(false)}>
                      <Icon className="size-4 shrink-0" />
                      <span className="lg:hidden">{item.label}</span>
                      <motion.span
                        animate={desktopCollapsed ? "collapsed" : "expanded"}
                        aria-hidden={desktopCollapsed}
                        className={cn(
                          "hidden overflow-hidden whitespace-nowrap lg:inline-block",
                          desktopCollapsed ? "lg:w-0" : "lg:w-auto",
                        )}
                        initial={false}
                        variants={sidebarCopyVariants}
                      >
                        {item.label}
                      </motion.span>
                    </Link>
                  </Button>
                );
              })}
            </nav>

            <div className={cn("mt-auto", desktopCollapsed && "lg:hidden")}>
              <NetworkStatusCard />
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-6">
          <header className="sticky top-0 z-20 -mx-4 border-b border-primary-foreground/15 bg-primary p-4 text-primary-foreground shadow-sm lg:top-4 lg:mx-0 lg:rounded-3xl lg:border lg:bg-primary/90 lg:backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  aria-label="Open mobile sidebar"
                  className="inline-flex size-10 items-center justify-center rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground/80 transition hover:bg-primary-foreground/15 hover:text-primary-foreground lg:hidden"
                  onClick={() => setMobileOpen(true)}
                  type="button"
                >
                  <MenuIcon className="size-4" />
                </button>
                <button
                  aria-label="Toggle desktop sidebar"
                  className="hidden size-10 items-center justify-center rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground/80 transition hover:bg-primary-foreground/15 hover:text-primary-foreground lg:inline-flex"
                  onClick={() => setDesktopCollapsed((value) => !value)}
                  type="button"
                >
                  <MenuIcon className="size-4" />
                </button>
                <Image
                  alt="FlightRax"
                  className="h-8 sm:h-9 w-auto object-contain"
                  height={32}
                  src="/logo/flightrax.png"
                  width={160}
                />
              </div>

              <div className="flex items-center gap-2.5 sm:gap-2">
                <Button
                  aria-label="Notifications"
                  size="icon"
                  variant="ghost"
                  className="relative rounded-full text-primary-foreground/85 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <BellIcon className="size-6 sm:size-5 " />
                  <span className="absolute right-1 top-1 sm:right-1.5 sm:top-1.5 size-2 sm:size-1.5 rounded-full bg-warning" />
                </Button>

                <Button
                  asChild
                  aria-label="Open account page"
                  className="rounded-full p-0 text-primary-foreground hover:bg-primary-foreground/10"
                  size="icon"
                  variant="ghost"
                >
                  <Link href="/account">
                    <Avatar className="border-2 border-primary-foreground/85">
                      {profile?.profile_photo_url && (
                        <AvatarImage
                          alt={`${profile.full_name} profile photo`}
                          src={profile.profile_photo_url}
                        />
                      )}
                      <AvatarFallback className="bg-linear-to-b from-primary to-tertiary text-primary-foreground">
                        {getAvatarFallback(
                          profile?.full_name?.trim() || profile?.email,
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </Button>
              </div>
            </div>
          </header>

          <main className="min-w-0 pb-8">{children}</main>
        </div>
      </div>
    </FlightRaxBackground>
  );
}
