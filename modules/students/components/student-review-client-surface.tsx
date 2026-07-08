"use client";

import { ClipboardCheckIcon } from "lucide-react";

import { StudentReviewList } from "@/modules/students/components/student-review-list";
import { useStudentReview } from "@/modules/students/hooks/use-student-review.query";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { Skeleton } from "@/shared/components/ui/skeleton";

function StudentReviewListSkeleton() {
  return (
    <div className="mt-6 space-y-6 sm:mt-0">
      <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-0">
        <Skeleton className="h-10 w-full max-w-xl bg-primary-foreground/15" />
        <Skeleton className="h-4 w-28 bg-primary-foreground/15" />
      </div>

      <div className="grid gap-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <GlassSurface className="overflow-hidden p-0" key={index}>
            <article className="divide-y divide-primary-foreground/10">
              <div className="p-4 sm:p-5">
                <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_10rem] md:items-start lg:grid-cols-[minmax(0,1fr)_11rem]">
                  <div className="grid gap-5">
                    <header className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-3">
                        <Skeleton className="h-7 w-44 rounded-full bg-primary-foreground/15" />
                        <Skeleton className="h-7 w-52 bg-primary-foreground/20 sm:h-8" />
                        <Skeleton className="h-4 w-64 bg-primary-foreground/15" />
                      </div>
                      <Skeleton className="h-7 w-24 shrink-0 rounded-full bg-primary-foreground/15" />
                    </header>

                    <section aria-label="Student review metadata loading">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-3 w-28 bg-primary-foreground/15" />
                        <span className="h-px flex-1 bg-primary-foreground/10" />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, itemIndex) => (
                          <div className="min-w-0 space-y-2" key={itemIndex}>
                            <Skeleton className="h-3 w-20 bg-primary-foreground/15" />
                            <Skeleton className="h-4 w-24 bg-primary-foreground/20" />
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="hidden min-w-0 md:flex md:justify-end">
                    <Skeleton className="h-56 w-full max-w-40 rounded-2xl bg-primary-foreground/10" />
                  </div>
                </div>
              </div>
            </article>
          </GlassSurface>
        ))}
      </div>
    </div>
  );
}

export function StudentReviewClientSurface() {
  const { error, isPending, students } = useStudentReview();

  if (isPending) {
    return <StudentReviewListSkeleton />;
  }

  if (error) {
    return (
      <EmptyState
        description={error.message}
        icon={<ClipboardCheckIcon className="size-7" />}
        title="Student requests could not be loaded"
      />
    );
  }

  if (students.length === 0) {
    return (
      <EmptyState
        description="Submitted student accounts that are pending or need a second look will appear here."
        icon={<ClipboardCheckIcon className="size-7" />}
        title="No student requests are waiting for review"
      />
    );
  }

  return <StudentReviewList students={students} />;
}
