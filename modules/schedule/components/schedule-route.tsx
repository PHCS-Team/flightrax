import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { SchedulePage } from "@/modules/schedule/components/schedule-page";
import { SCHEDULE_MANAGE } from "@/modules/schedule/constants/permissions";
import { SCHEDULE_QUERY_KEYS } from "@/modules/schedule/queries/query-keys";
import { getScheduleDay } from "@/modules/schedule/services/schedule.server";
import { operationsToday } from "@/modules/schedule/utils/schedule-time";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission } from "@/shared/lib/rbac/config";
import { getQueryClient } from "@/shared/lib/query-client";

export async function ScheduleRoute() {
  const queryClient = getQueryClient();
  const today = operationsToday();
  const [viewer] = await Promise.all([
    getCurrentAuthorizationProfile(),
    queryClient.prefetchQuery({
      queryKey: SCHEDULE_QUERY_KEYS.day(today),
      queryFn: () => getScheduleDay(today),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SchedulePage
        canManage={
          viewer
            ? hasPermission(viewer.role, SCHEDULE_MANAGE, viewer.admin_department)
            : false
        }
      />
    </HydrationBoundary>
  );
}
