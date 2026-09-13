"use client";

import { useQuery } from "@tanstack/react-query";

import { schedulePeopleQueryOptions } from "@/modules/schedule/queries/schedule";

export function useSchedulePeople(enabled = true) {
  return useQuery({ ...schedulePeopleQueryOptions(), enabled });
}
