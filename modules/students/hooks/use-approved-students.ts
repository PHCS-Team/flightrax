"use client";

import { useQuery } from "@tanstack/react-query";

import { approvedStudentsQueryOptions } from "@/modules/students/queries/approved-students";

export function useApprovedStudents() {
  const query = useQuery(approvedStudentsQueryOptions());

  return {
    ...query,
    students: query.data ?? [],
  };
}
