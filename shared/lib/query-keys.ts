// Parent query keys shared across module boundaries so one module can
// invalidate another module's cached lists without importing from it.
export const STUDENTS_PARENT_QUERY_KEY = ["students"] as const;
