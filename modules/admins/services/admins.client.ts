import type { PaginatedResponse } from "@/shared/types/pagination";
import type { AdminAccount } from "@/modules/admins/types/admin";
import { getApiErrorMessage } from "@/shared/lib/api-error";

export async function fetchAdminsPage(
  page: number,
  pageSize: number,
  search: string,
) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (search) params.set("search", search);

  const response = await fetch(`/api/admins?${params}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, "Unable to load admins."));
  }

  return (await response.json()) as PaginatedResponse<AdminAccount>;
}
