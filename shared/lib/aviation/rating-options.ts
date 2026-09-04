import { queryOptions } from "@tanstack/react-query";

import { getApiErrorMessage } from "@/shared/lib/api-error";
import { RATING_OPTIONS_QUERY_KEY } from "@/shared/lib/query-keys";
import type { RatingOption } from "@/shared/types/rating-option";

export async function fetchRatingOptions(): Promise<RatingOption[]> {
  const response = await fetch("/api/aviation/rating-options", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Unable to load ratings."),
    );
  }

  return (await response.json()) as RatingOption[];
}

export function ratingOptionsQueryOptions() {
  return queryOptions({
    queryFn: fetchRatingOptions,
    queryKey: RATING_OPTIONS_QUERY_KEY,
    staleTime: 5 * 60 * 1000,
  });
}
