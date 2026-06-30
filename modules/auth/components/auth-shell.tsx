import type { ReactNode } from "react";
import Link from "next/link";
import { PlaneIcon } from "lucide-react";

import { FlightRaxBackground } from "@/shared/components/layout/flightrax-background";

export function AuthShell({
  children,
  eyebrow,
  title,
  description,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <FlightRaxBackground className="min-h-screen">
      <main className="grid min-h-screen lg:grid-cols-[1fr_0.9fr]">
        <section className="flex flex-col justify-between p-8 md:p-12">
          <Link href="/" className="flex items-center gap-3 text-lg font-semibold">
            <span className="flex size-10 items-center justify-center rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">
              <PlaneIcon className="size-5" />
            </span>
            FlightRax
          </Link>
          <div className="max-w-xl py-16">
            <p className="text-sm uppercase tracking-[0.3em] text-primary-foreground/75">
              {eyebrow}
            </p>
            <h1 className="mt-5 text-5xl font-semibold tracking-tight md:text-6xl">
              {title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-primary-foreground/80">
              {description ??
                "Supabase Auth powers identity while FlightRax profiles control approval, departments, and app permissions."}
            </p>
          </div>
        </section>
        <section className="flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md rounded-3xl border bg-card/90 p-6 shadow-sm backdrop-blur">
            {children}
          </div>
        </section>
      </main>
    </FlightRaxBackground>
  );
}
