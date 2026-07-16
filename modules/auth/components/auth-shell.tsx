import type { ReactNode } from "react";
import Link from "next/link";

import { FlightRaxBackground } from "@/shared/components/layout/flightrax-background";
import { cn } from "@/shared/lib/utils";
import Image from "next/image";

type AuthShellSurface = "glass" | "bare";

export function AuthShell({
  children,
  contentClassName,
  eyebrow,
  title,
  description,
  surface = "glass",
}: {
  children: ReactNode;
  contentClassName?: string;
  eyebrow: string;
  title: string;
  description?: string;
  surface?: AuthShellSurface;
}) {
  return (
    <FlightRaxBackground className="min-h-screen">
      <main className="grid min-h-screen gap-y-8 lg:grid-cols-[1fr_0.9fr] lg:gap-y-0">
        <section className="flex flex-col justify-between p-8 pb-0 sm:p-12">
          <Link
            href="/"
            className="flex items-center gap-3 text-lg font-semibold"
          >
            <Image
              alt="FlightraX"
              className="h-auto w-34 object-contain sm:w-47"
              height={72}
              loading="eager"
              priority
              src="/logo/flightrax-white.png"
              width={244}
            />
          </Link>
          <div className="max-w-xl pt-12 sm:pb-16">
            <p className="text-sm uppercase tracking-[0.3em] text-primary-foreground/75">
              {eyebrow}
            </p>
            <h1 className="mt-2 sm:mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">
              {title}
            </h1>
            <p className="mt-5 hidden sm:block text-lg leading-8 text-primary-foreground/80">
              {description ??
                "Supabase Auth powers identity while FlightraX profiles control approval, departments, and app permissions."}
            </p>
          </div>
        </section>
        <section
          className={cn(
            "flex items-center justify-center",
            surface === "glass"
              ? "p-0 sm:p-6 md:p-12"
              : "px-4 py-8 sm:p-6 md:p-12",
          )}
        >
          <div
            className={cn(
              "w-full text-primary-foreground",
              surface === "glass"
                ? "max-w-md border-y border-primary-foreground/20 bg-primary-foreground/10 p-6 shadow-sm backdrop-blur sm:rounded-3xl sm:border sm:bg-primary-foreground/15 [&_.text-destructive]:text-red-200 [&_.text-foreground]:text-primary-foreground [&_.text-muted-foreground]:text-primary-foreground/70 [&_input]:border-primary-foreground/20 [&_input]:bg-primary-foreground/95 [&_input]:text-foreground [&_input]:placeholder:text-muted-foreground [&_input[aria-invalid=true]]:border-red-200/60 [&_input[aria-invalid=true]]:ring-red-200/25 **:data-[slot=select-trigger]:border-primary-foreground/20 **:data-[slot=select-trigger]:bg-primary-foreground/95 **:data-[slot=select-trigger]:text-foreground [&_[data-slot=select-trigger][aria-invalid=true]]:border-red-200/60 [&_[data-slot=select-trigger][aria-invalid=true]]:ring-red-200/25 [&_[data-slot=select-trigger][data-placeholder]]:text-muted-foreground"
                : "max-w-xl",
              contentClassName,
            )}
          >
            {children}
          </div>
        </section>
      </main>
    </FlightRaxBackground>
  );
}
