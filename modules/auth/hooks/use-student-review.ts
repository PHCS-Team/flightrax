"use client";

import { useQuery } from "@tanstack/react-query";

import { studentReviewQueryOptions } from "@/modules/auth/queries/student-review-options";

export function useStudentReview() {
  const query = useQuery(studentReviewQueryOptions());

  return {
    ...query,
    students: query.data ?? [],
  };
}
