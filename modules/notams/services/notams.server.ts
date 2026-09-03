"use server";

import { createAdminClient } from "@/shared/lib/supabase/admin";
import type { Notam } from "@/modules/notams/types/notam";
import type { PaginatedResponse } from "@/shared/types/pagination";
import { toNotam } from "@/modules/notams/types/notam";

type SeverityFilter = "" | "advisory" | "warning" | "alert";

export async function getNotamsPage(
  page: number,
  pageSize: number,
  search: string,
  severity: SeverityFilter,
  expiry: string,
): Promise<PaginatedResponse<Notam>> {
  const supabase = createAdminClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("notams")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (severity) {
    query = query.eq("severity", severity);
  }

  if (expiry) {
    const now = new Date().toISOString().split("T")[0];
    if (expiry === "active") {
      query = query.or(`expires_at.is.null,expires_at.gte.${now}`);
    } else if (expiry === "expired") {
      query = query.lt("expires_at", now);
    } else if (expiry === "no_expiry") {
      query = query.is("expires_at", null);
    }
  }

  const { data, error, count: totalCount } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    data: (data ?? []).map(toNotam),
    totalCount: total,
    page,
    pageSize,
    totalPages,
  };
}