"use client";

import { useQuery } from "@tanstack/react-query";

import { approvedInstructorsQueryOptions } from "@/modules/instructors/queries/instructors";

export function useApprovedInstructors(
  page: number,
  pageSize: number,
  search: string,
) {
  const query = useQuery(approvedInstructorsQueryOptions(page, pageSize, search));

  return {
    ...query,
    instructors: query.data?.data ?? [],
    totalCount: query.data?.totalCount ?? 0,
    totalPages: query.data?.totalPages ?? 0,
    page: query.data?.page ?? page,
    pageSize: query.data?.pageSize ?? pageSize,
  };
}
