"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";

import { SCHEDULE_VIEWS } from "@/modules/schedule/constants/schedule-views";

export function useScheduleView() {
  return useQueryState(
    "view",
    parseAsStringLiteral(SCHEDULE_VIEWS).withDefault("board"),
  );
}
