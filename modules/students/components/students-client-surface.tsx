"use client";

import { useEffect } from "react";

import { GraduationCapIcon } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { StudentsTable } from "@/modules/students/components/students-table";
import { useApprovedStudents } from "@/modules/students/hooks/use-approved-students.query";
import { useDebouncedQueryState } from "@/shared/hooks/use-debounced-query-state";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";

const DEFAULT_PAGE_SIZE = 10;

export function StudentsClientSurface() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  );

  const [searchInput, setSearchInput, committedSearch] = useDebouncedQueryState(
    "search",
    parseAsString.withDefault(""),
  );

  useEffect(() => {
    setPage(1);
  }, [committedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const { error, isPending, students, totalCount, totalPages } =
    useApprovedStudents(page, pageSize, committedSearch);

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

  return (
    <StudentsTable
      onPageChange={setPage}
      onSearchChange={setSearchInput}
      page={page}
      pageSize={pageSize}
      search={searchInput}
      students={students}
      totalCount={totalCount}
      totalPages={totalPages}
    />
  );
}
