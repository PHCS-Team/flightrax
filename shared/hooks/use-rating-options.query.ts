"use client";

import { useQuery } from "@tanstack/react-query";

import { ratingOptionsQueryOptions } from "@/shared/lib/aviation/rating-options";
import type { RatingOption } from "@/shared/types/rating-option";

const EMPTY: RatingOption[] = [];

export function useRatingOptions() {
  const query = useQuery(ratingOptionsQueryOptions());

  return { ...query, ratingOptions: query.data ?? EMPTY };
}
