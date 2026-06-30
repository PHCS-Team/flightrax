"use client";

import Image from "next/image";
import Link from "next/link";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { motion, type Variants } from "motion/react";
import {
  ActivityIcon,
  BellIcon,
  CalendarClockIcon,
  ChevronDownIcon,
  GaugeIcon,
  LogOutIcon,
  MenuIcon,
  PlaneIcon,
  RadarIcon,
  SettingsIcon,
  UserCheckIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";

import { logoutAction } from "@/modules/auth/actions/logout";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { FlightRaxBackground } from "@/shared/components/layout/flightrax-background";
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

function handleLogoutSubmit(event: FormEvent<HTMLFormElement>) {
  if (!window.confirm("Log out of FlightRax?")) {
    event.preventDefault();
  }
}

function getAvatarFallback(profile: Profile | null) {
  const source =
    profile?.full_name?.trim() || profile?.email?.trim() || "FlightRax";
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((part) => part.at(0)?.toUpperCase() ?? "")
    .join("");

  return initials || "FR";
}

function AccountAvatar({
  profile,
  size = "sm",
}: {
  profile: Profile | null;
  size?: "sm" | "lg";
}) {
  return (
    <Avatar size={size}>
      <AvatarFallback className="bg-primary-foreground/15 text-primary-foreground">
        {getAvatarFallback(profile)}
      </AvatarFallback>
    </Avatar>
  );
}

function AccountContent({ profile }: { profile: Profile | null }) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 p-3">
        <div className="flex items-start gap-3">
          <AccountAvatar profile={profile} size="lg" />
          <div className="min-w-0 flex-1">
            {profile?.full_name && (
              <p className="truncate text-sm font-semibold text-primary-foreground">
                {profile.full_name}
              </p>
            )}
            <p className="truncate text-sm text-primary-foreground/75">
              {profile?.email ?? "Profile unavailable"}
            </p>
            {profile?.student_id_number && (
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-primary-foreground/60">
                ID {profile.student_id_number}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <Button
          className="h-auto justify-start rounded-2xl border-primary-foreground/15 bg-primary-foreground/10 py-3 text-primary-foreground opacity-60"
          disabled
          type="button"
          variant="outline"
        >
          <SettingsIcon className="size-4" />
          <span className="flex flex-col items-start leading-none">
            <span>Account settings</span>
            <span className="mt-1 text-xs font-normal text-primary-foreground/65">
              Coming soon
            </span>
          </span>
        </Button>

        <form action={logoutAction} onSubmit={handleLogoutSubmit}>
          <Button
            className="w-full justify-start rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-destructive/25 hover:text-primary-foreground"
            type="submit"
            variant="destructive"
          >
            <LogOutIcon className="size-4" />
            Logout
          </Button>
        </form>
      </div>
    </div>
  );
}

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

              <div className="flex items-center gap-2">
                <Button
                  aria-label="Notifications"
                  size="icon"
                  variant="outline"
                  className="relative rounded-2xl border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
                >
                  <BellIcon className="size-4" />
                  <span className="absolute right-2 top-2 size-2 rounded-full bg-warning" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="hidden rounded-2xl border-primary-foreground/20 bg-primary-foreground/10 pl-1.5 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground sm:flex"
                    >
                      <AccountAvatar profile={profile} />
                      <span className="text-sm font-medium">Account</span>
                      <ChevronDownIcon className="size-4 text-primary-foreground/70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-80 rounded-2xl border-primary-foreground/15 bg-primary p-2 text-primary-foreground shadow-xl"
                  >
                    <AccountContent profile={profile} />
                  </DropdownMenuContent>
                </DropdownMenu>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      aria-label="Open account menu"
                      className="rounded-2xl border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground sm:hidden"
                      size="icon"
                      variant="outline"
                    >
                      <AccountAvatar profile={profile} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    className="border-primary-foreground/15 bg-primary p-0 text-primary-foreground sm:hidden"
                    side="right"
                  >
                    <SheetHeader className="border-b border-primary-foreground/15 p-4 pr-12">
                      <SheetTitle className="text-primary-foreground">
                        Account
                      </SheetTitle>
                    </SheetHeader>
                    <div className="p-4">
                      <AccountContent profile={profile} />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </header>

          <main className="min-w-0 pb-8">{children}</main>
        </div>
      </div>
    </FlightRaxBackground>
  );
}
