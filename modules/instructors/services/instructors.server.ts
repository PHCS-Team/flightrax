import "server-only";

import { APPROVAL_STATUS, ROLE } from "@/shared/lib/rbac/config";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { PROFILE_PHOTO_BUCKET } from "@/shared/lib/storage/buckets";
import type { CertificateSummary } from "@/shared/types/certificate-summary";
import type { LicenseSummary } from "@/shared/types/license-summary";
import type { PaginatedResponse } from "@/shared/types/pagination";
import type {
  ApprovedInstructor,
  ApprovedInstructorRow,
} from "@/modules/instructors/types/instructor";

async function getMatchingProfileIds(
  supabase: ReturnType<typeof createAdminClient>,
  search: string,
): Promise<string[]> {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    .eq("role", ROLE.INSTRUCTOR);

  return data?.map((p) => p.id) ?? [];
}

function buildSearchFilter(search: string, matchingProfileIds: string[]) {
  const filters: string[] = [`id_number.ilike.%${search}%`];

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

async function getCertificatesByProfileIds(
  supabase: ReturnType<typeof createAdminClient>,
  profileIds: string[],
): Promise<Map<string, CertificateSummary[]>> {
  if (profileIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("certificates")
    .select(
      "id, user_id, title, description, expiry_date, has_no_expiry, created_at, image_path",
    )
    .in("user_id", profileIds);

  if (error) {
    throw new Error(error.message);
  }

  const certificatesByProfile = new Map<string, CertificateSummary[]>();

  for (const row of data ?? []) {
    const certificates = certificatesByProfile.get(row.user_id) ?? [];
    certificates.push(row);
    certificatesByProfile.set(row.user_id, certificates);
  }

  return certificatesByProfile;
}

export async function getApprovedInstructorsPage(
  page: number,
  pageSize: number,
  search: string,
): Promise<PaginatedResponse<ApprovedInstructor>> {
  const supabase = createAdminClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("account_requests")
    .select(
      "approval_status, profile_id, id_number, profiles!account_requests_profile_id_fkey(email, full_name, profile_photo_path, role)",
      { count: "exact" },
    )
    .eq("request_type", ROLE.INSTRUCTOR)
    .eq("approval_status", APPROVAL_STATUS.APPROVED);

  if (search) {
    const matchingProfileIds = await getMatchingProfileIds(supabase, search);
    query = query.or(buildSearchFilter(search, matchingProfileIds));
  }

  const {
    data,
    error,
    count: totalCount,
  } = await query.order("id_number", { ascending: true }).range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const rows = data satisfies ApprovedInstructorRow[];
  const instructors = rows.filter(
    (row) => row.profiles?.role === ROLE.INSTRUCTOR,
  );
  const instructorIds = instructors.map((instructor) => instructor.profile_id);
  const [licensesByProfile, certificatesByProfile] = await Promise.all([
    getLicensesByProfileIds(supabase, instructorIds),
    getCertificatesByProfileIds(supabase, instructorIds),
  ]);
  const { storage } = supabase;

  return {
    data: instructors.map((row) => ({
      id: row.profile_id,
      email: row.profiles?.email ?? "Unknown email",
      fullName: row.profiles?.full_name ?? "Unknown instructor",
      instructorIdNumber: row.id_number ?? "Missing ID number",
      profilePhotoUrl: row.profiles?.profile_photo_path
        ? storage
            .from(PROFILE_PHOTO_BUCKET)
            .getPublicUrl(row.profiles.profile_photo_path).data.publicUrl
        : null,
      licenses: licensesByProfile.get(row.profile_id) ?? [],
      certificates: certificatesByProfile.get(row.profile_id) ?? [],
    })),
    totalCount: total,
    page,
    pageSize,
    totalPages,
  };
}
