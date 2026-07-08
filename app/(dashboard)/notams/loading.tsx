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
          <Skeleton className="hidden h-4 w-32 bg-primary-foreground/20 sm:block" />
          <Skeleton className="h-8 w-40 bg-primary-foreground/25 md:h-10 md:w-52" />
        </div>
      </div>

      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <CardTitle className="w-full">
                <Skeleton className="h-5 w-36" />
              </CardTitle>
              <Skeleton className="size-5 shrink-0 rounded-full" />
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <Skeleton className="h-4 w-full max-w-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
