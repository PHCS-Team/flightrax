"use client";

import { GraduationCapIcon } from "lucide-react";

import { StudentsTable } from "@/modules/students/components/students-table";
import { useApprovedStudents } from "@/modules/students/hooks/use-approved-students.query";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { Skeleton } from "@/shared/components/ui/skeleton";

function StudentsTableSkeleton() {
  return (
    <GlassSurface className="space-y-4 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-full max-w-sm bg-primary-foreground/15" />
        <Skeleton className="h-4 w-28 bg-primary-foreground/15" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-primary-foreground/10">
        <div className="grid min-w-full grid-cols-[2fr_1.5fr_1fr_1fr] border-b border-primary-foreground/20 px-2 py-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton className="h-4 w-24 bg-primary-foreground/15" key={index} />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <div
            className="grid min-w-full grid-cols-[2fr_1.5fr_1fr_1fr] items-center border-b border-primary-foreground/10 px-2 py-3 last:border-b-0"
            key={rowIndex}
          >
            <div className="flex min-w-64 items-center gap-3">
              <Skeleton className="size-11 shrink-0 rounded-full bg-primary-foreground/15" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-36 bg-primary-foreground/20" />
                <Skeleton className="h-4 w-28 bg-primary-foreground/15" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 bg-primary-foreground/20" />
              <Skeleton className="h-4 w-24 bg-primary-foreground/15" />
            </div>
            <Skeleton className="h-4 w-20 bg-primary-foreground/15" />
            <Skeleton className="h-9 w-20 rounded-lg bg-primary-foreground/15" />
          </div>
        ))}
      </div>
    </GlassSurface>
  );
}

export function StudentsClientSurface() {
  const { error, isPending, students } = useApprovedStudents();

  if (isPending) {
    return <StudentsTableSkeleton />;
  }

  if (error) {
    return (
      <EmptyState
        description={error.message}
        icon={<GraduationCapIcon className="size-7" />}
        title="Students could not be loaded"
      />
    );
  }

  if (students.length === 0) {
    return (
      <EmptyState
        description="Approved student accounts will appear here once they are ready for scheduling and flight operations."
        icon={<GraduationCapIcon className="size-7" />}
        title="No approved students yet"
      />
    );
  }

  return <StudentsTable students={students} />;
}
