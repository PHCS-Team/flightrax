"use client";

import { GraduationCapIcon } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";

import { StudentsTable } from "@/modules/students/components/students-table";
import { useApprovedStudents } from "@/modules/students/hooks/use-approved-students.query";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { EmptyState } from "@/shared/components/layout/empty-state";

const DEFAULT_PAGE_SIZE = 10;

export function StudentsClientSurface() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  );

  const { error, isPending, students, totalCount, totalPages } =
    useApprovedStudents(page, pageSize);

  if (isPending) {
    return <LoadingScreen />;
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

  return (
    <StudentsTable
      onPageChange={setPage}
      page={page}
      pageSize={pageSize}
      students={students}
      totalCount={totalCount}
      totalPages={totalPages}
    />
  );
}
