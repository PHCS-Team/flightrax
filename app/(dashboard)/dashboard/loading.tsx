import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function Loading() {
  return (
    <section>
      <div className="flex items-center justify-between gap-4 border-b border-primary-foreground/15 p-4 sm:border-none">
        <div className="min-w-0 space-y-3">
          <Skeleton className="hidden h-4 w-24 bg-primary-foreground/20 sm:block" />
          <Skeleton className="h-8 w-48 bg-primary-foreground/25 md:h-10 md:w-64" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="w-full">
                <Skeleton className="h-4 w-24" />
              </CardTitle>
              <Skeleton className="size-5 shrink-0 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-16" />
              <Skeleton className="mt-2 h-4 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
