import type { ReactNode } from "react";
import Link from "next/link";
import { PlaneIcon } from "lucide-react";

export function AuthShell({
  children,
  eyebrow,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <main className="grid min-h-screen bg-[radial-gradient(circle_at_80%_20%,color-mix(in_oklch,var(--primary),transparent_82%),transparent_30rem),linear-gradient(135deg,var(--background),var(--muted))] lg:grid-cols-[1fr_0.9fr]">
      <section className="flex flex-col justify-between p-8 md:p-12">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <PlaneIcon className="size-5" />
          </span>
          FlightRax
        </Link>
        <div className="max-w-xl py-16">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            {eyebrow}
          </p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight md:text-6xl">
            {title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Authentication is static for now. Supabase Auth clients are being
            placed in `shared/lib/supabase` so the forms can be wired through
            safe actions later.
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md rounded-3xl border bg-card/90 p-6 shadow-sm backdrop-blur">
          {children}
        </div>
      </section>
    </main>
  );
}
