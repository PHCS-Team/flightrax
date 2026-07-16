export const STUDENTS_QUERY_KEYS = {
  all: ["students"] as const,
  approved: (page: number, pageSize: number) =>
    ["students", "approved", { page, pageSize }] as const,
};

export const STUDENT_REVIEW_QUERY_KEYS = {
  list: ["student-review", "list"] as const,
  documentUrl: (studentId: string) =>
    ["student-review", "document", studentId] as const,
};
