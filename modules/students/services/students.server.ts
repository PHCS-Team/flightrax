import "server-only";

import { APPROVAL_STATUS, ROLE } from "@/shared/lib/rbac/config";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { PROFILE_PHOTO_BUCKET } from "@/shared/lib/storage/buckets";
import type { LicenseSummary } from "@/shared/types/license-summary";
import type { PaginatedResponse } from "@/shared/types/pagination";
import type {
  ApprovedStudent,
  ApprovedStudentRow,
} from "@/modules/students/types/student";

async function getMatchingProfileIds(
  supabase: ReturnType<typeof createAdminClient>,
  search: string,
): Promise<string[]> {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    .eq("role", ROLE.STUDENT);

  return data?.map((p) => p.id) ?? [];
}

function buildSearchFilter(search: string, matchingProfileIds: string[]) {
  const filters: string[] = [`student_id_number.ilike.%${search}%`];

  if (matchingProfileIds.length > 0) {
    filters.push(`profile_id.in.(${matchingProfileIds.join(",")})`);
  }

  return filters.join(",");
}

async function getLicensesByProfileIds(
  supabase: ReturnType<typeof createAdminClient>,
  profileIds: string[],
): Promise<Map<string, LicenseSummary[]>> {
  if (profileIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("licenses")
    .select(
      "id, user_id, license_type, license_number, ratings, status, expiry_date, has_no_expiry, created_at, id_front_path, id_back_path",
    )
    .in("user_id", profileIds);

  if (error) {
    throw new Error(error.message);
  }

  const licensesByProfile = new Map<string, LicenseSummary[]>();

  for (const row of data ?? []) {
    const licenses = licensesByProfile.get(row.user_id) ?? [];
    licenses.push(row);
    licensesByProfile.set(row.user_id, licenses);
  }

  return licensesByProfile;
}

export async function getApprovedStudentsPage(
  page: number,
  pageSize: number,
  search: string,
): Promise<PaginatedResponse<ApprovedStudent>> {
  const supabase = createAdminClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("student_profiles")
    .select(
      "approval_status, profile_id, student_id_number, profiles!student_profiles_profile_id_fkey(email, full_name, profile_photo_path, role)",
      { count: "exact" },
    )
    .eq("approval_status", APPROVAL_STATUS.APPROVED);

  if (search) {
    const matchingProfileIds = await getMatchingProfileIds(supabase, search);
    query = query.or(buildSearchFilter(search, matchingProfileIds));
  }

  const {
    data,
    error,
    count: totalCount,
  } = await query
    .order("student_id_number", { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const rows = data satisfies ApprovedStudentRow[];
  const students = rows.filter((row) => row.profiles?.role === ROLE.STUDENT);
  const licensesByProfile = await getLicensesByProfileIds(
    supabase,
    students.map((student) => student.profile_id),
  );
  const { storage } = supabase;

  return {
    data: students.map((row) => ({
      id: row.profile_id,
      email: row.profiles?.email ?? "Unknown email",
      fullName: row.profiles?.full_name ?? "Unknown student",
      studentIdNumber: row.student_id_number ?? "Missing ID number",
      profilePhotoUrl: row.profiles?.profile_photo_path
        ? storage
            .from(PROFILE_PHOTO_BUCKET)
            .getPublicUrl(row.profiles.profile_photo_path).data.publicUrl
        : null,
      licenses: licensesByProfile.get(row.profile_id) ?? [],
    })),
    totalCount: total,
    page,
    pageSize,
    totalPages,
  };
}
