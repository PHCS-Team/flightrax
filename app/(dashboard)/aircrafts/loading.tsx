import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function Loading() {
  return (
    <section className="space-y-6 py-2">
      <div className="flex items-center justify-between gap-4 border-b border-primary-foreground/15 p-4 sm:border-none">
        <div className="min-w-0 space-y-3">
          <Skeleton className="hidden h-4 w-36 bg-primary-foreground/20 sm:block" />
          <Skeleton className="h-8 w-64 bg-primary-foreground/25 md:h-10 md:w-80" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-5 w-24" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
