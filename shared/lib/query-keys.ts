// Parent query keys shared across module boundaries so one module can
// invalidate another module's cached lists without importing from it.
export const STUDENTS_PARENT_QUERY_KEY = ["students"] as const;

// Ratings are derived from aircraft types; the aircrafts module invalidates
// this after any type change so license pickers and labels refresh.
export const RATING_OPTIONS_QUERY_KEY = ["aviation", "rating-options"] as const;
