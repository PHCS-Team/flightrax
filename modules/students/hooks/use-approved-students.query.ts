"use client";

import { useQuery } from "@tanstack/react-query";

import { approvedStudentsQueryOptions } from "@/modules/students/queries/students";

export function useApprovedStudents(page: number, pageSize: number) {
  const query = useQuery(approvedStudentsQueryOptions(page, pageSize));

  return {
    ...query,
    students: query.data?.data ?? [],
    totalCount: query.data?.totalCount ?? 0,
    totalPages: query.data?.totalPages ?? 0,
    page: query.data?.page ?? page,
    pageSize: query.data?.pageSize ?? pageSize,
  };
}
