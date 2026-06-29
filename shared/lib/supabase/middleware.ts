import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { getSupabaseConfig } from "@/shared/lib/supabase/config";
import { APPROVAL_STATUS, ROLE } from "@/shared/lib/rbac/config";
import { canAccessPath, getDefaultRedirectForProfile, isAuthPath, isProtectedPath } from "@/shared/lib/rbac/routes";
import type { AdminDepartment, ApprovalStatus, Profile, ProfileRole } from "@/shared/lib/rbac/types";
import type { Database } from "@/shared/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type StudentProfileApproval = Pick<
  Database["public"]["Tables"]["student_profiles"]["Row"],
  "approval_status"
>;
type AdminProfileDepartment = Pick<
  Database["public"]["Tables"]["admin_profiles"]["Row"],
  "department"
>;

type ProfileWithRoleProfiles = ProfileRow & {
  student_profiles: StudentProfileApproval | null;
  admin_profiles: AdminProfileDepartment | null;
};

function getEffectiveApprovalStatus(
  role: ProfileRole,
  studentApprovalStatus: ApprovalStatus | null,
): ApprovalStatus {
  if (role === ROLE.STUDENT) {
    return studentApprovalStatus ?? APPROVAL_STATUS.PENDING;
  }

  return APPROVAL_STATUS.APPROVED;
}

function getAdminDepartment(
  role: ProfileRole,
  adminDepartment: AdminDepartment | null,
): AdminDepartment | null {
  return role === ROLE.ADMIN ? adminDepartment : null;
}

function toProfile(row: ProfileWithRoleProfiles): Profile {
  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    role: row.role,
    created_at: row.created_at,
    updated_at: row.updated_at,
    admin_department: getAdminDepartment(row.role, row.admin_profiles?.department ?? null),
    approval_status: getEffectiveApprovalStatus(
      row.role,
      row.student_profiles?.approval_status ?? null,
    ),
  };
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  let response = NextResponse.next({ request });
  const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig();

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });

          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isProtectedPath(pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("*, student_profiles!student_profiles_profile_id_fkey(approval_status), admin_profiles!admin_profiles_profile_id_fkey(department)")
    .eq("id", user.id)
    .maybeSingle();
  const profile = profileRow ? toProfile(profileRow) : null;

  if (!profile) {
    if (isProtectedPath(pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
  }

  if (isAuthPath(pathname)) {
    return NextResponse.redirect(new URL(getDefaultRedirectForProfile(profile), request.url));
  }

  if (pathname === "/pending-approval") {
    return profile.approval_status === APPROVAL_STATUS.APPROVED
      ? NextResponse.redirect(new URL(getDefaultRedirectForProfile(profile), request.url))
      : response;
  }

  if (isProtectedPath(pathname) && !canAccessPath(profile, pathname)) {
    return NextResponse.redirect(new URL(getDefaultRedirectForProfile(profile), request.url));
  }

  return response;
}
