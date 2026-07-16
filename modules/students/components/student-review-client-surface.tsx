"use client";

import { ClipboardCheckIcon } from "lucide-react";

import { StudentReviewList } from "@/modules/students/components/student-review-list";
import { useStudentReview } from "@/modules/students/hooks/use-student-review.query";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { EmptyState } from "@/shared/components/layout/empty-state";

export function StudentReviewClientSurface() {
  const { error, isPending, students } = useStudentReview();

  if (isPending) {
    return <LoadingScreen />;
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
