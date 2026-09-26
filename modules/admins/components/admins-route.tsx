import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { AdminsPage } from "@/modules/admins/components/admins-page";
import { ADMINS_QUERY_KEYS } from "@/modules/admins/queries/query-keys";
import { getAdminsPage } from "@/modules/admins/services/admins.server";
import { getQueryClient } from "@/shared/lib/query-client";

export async function AdminsRoute() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ADMINS_QUERY_KEYS.list(1, 10, ""),
    queryFn: () => getAdminsPage(1, 10, ""),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminsPage />
    </HydrationBoundary>
  );
}
