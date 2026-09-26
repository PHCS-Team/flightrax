import "server-only";

import { ROLE } from "@/shared/lib/rbac/config";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { PROFILE_PHOTO_BUCKET } from "@/shared/lib/storage/buckets";
import type { PaginatedResponse } from "@/shared/types/pagination";
import type { AdminAccount, AdminAccountRow } from "@/modules/admins/types/admin";
import { describeActionError } from "@/shared/lib/action-error";

export async function getAdminsPage(
  page: number,
  pageSize: number,
  search: string,
): Promise<PaginatedResponse<AdminAccount>> {
  const supabase = createAdminClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("profiles")
    .select(
      "id, email, full_name, profile_photo_path, admin_profiles!admin_profiles_profile_id_fkey(department)",
      { count: "exact" },
    )
    .eq("role", ROLE.ADMIN);

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const {
    data,
    error,
    count: totalCount,
  } = await query.order("full_name", { ascending: true }).range(from, to);

  if (error) {
    throw new Error(describeActionError(error));
  }

  const total = totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const rows = data satisfies AdminAccountRow[];
  const { storage } = supabase;

  return {
    data: rows.map((row) => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      department: row.admin_profiles?.department ?? null,
      profilePhotoUrl: row.profile_photo_path
        ? storage.from(PROFILE_PHOTO_BUCKET).getPublicUrl(row.profile_photo_path)
            .data.publicUrl
        : null,
    })),
    totalCount: total,
    page,
    pageSize,
    totalPages,
  };
}
