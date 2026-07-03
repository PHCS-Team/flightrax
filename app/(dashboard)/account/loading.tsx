import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function Loading() {
  return (
    <section>
      <div className="flex items-center justify-between gap-4 border-b border-primary-foreground/15 p-4 sm:border-none">
        <div className="min-w-0 space-y-3">
          <Skeleton className="hidden h-4 w-40 bg-primary-foreground/20 sm:block" />
          <Skeleton className="h-8 w-44 bg-primary-foreground/25 md:h-10 md:w-56" />
        </div>
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <Skeleton className="h-10 w-32 rounded-2xl bg-primary-foreground/20" />
          <Skeleton className="h-10 w-24 rounded-2xl bg-primary-foreground/20" />
        </div>
      </div>

      <div className="relative my-2 overflow-hidden px-6 py-4 sm:mb-5 sm:py-6">
        <div className="flex items-center gap-4 md:gap-6">
          <Skeleton className="size-24 shrink-0 rounded-full bg-primary-foreground/20 md:size-32" />
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-10 w-52 bg-primary-foreground/25 md:h-16 md:w-80" />
            <Skeleton className="h-6 w-44 bg-primary-foreground/20 md:h-8 md:w-64" />
            <Skeleton className="h-4 w-56 bg-primary-foreground/20 md:w-72" />
          </div>
        </div>
      </div>

      <div className="flex w-full gap-2 border-y border-primary-foreground/15 p-1.5 md:w-fit md:border-x">
        <Skeleton className="h-9 w-24 rounded-lg bg-primary-foreground/20" />
        <Skeleton className="h-9 w-20 rounded-lg bg-primary-foreground/15" />
      </div>

      <GlassSurface className="divide-y divide-primary-foreground/10 md:grid md:grid-cols-3 md:divide-x md:divide-y-0 md:p-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="flex items-center gap-3 p-4 md:p-5" key={index}>
            <Skeleton className="size-10 shrink-0 rounded-lg bg-primary-foreground/15 md:rounded-2xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-24 bg-primary-foreground/15" />
              <Skeleton className="h-5 w-32 bg-primary-foreground/20" />
            </div>
          </div>
        ))}
      </GlassSurface>
    </section>
  );
}
