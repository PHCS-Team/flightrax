"use client";

import { useQuery } from "@tanstack/react-query";

import { studentReviewQueryOptions } from "@/modules/students/queries/student-review";

export function useStudentReview() {
  const query = useQuery(studentReviewQueryOptions());

  return {
    ...query,
    students: query.data ?? [],
  };
}
