import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { getSupabaseConfig } from "@/shared/lib/supabase/config";
import { APPROVAL_STATUS } from "@/shared/lib/rbac/config";
import {
  getAdminDepartment,
  getEffectiveApprovalStatus,
} from "@/shared/lib/rbac/profile";
import { APP_SETTING_KEYS } from "@/shared/lib/app-settings";
import {
  canAccessPath,
  getDefaultRedirectForProfile,
  isAuthPath,
  isProtectedPath,
  isSuperadminMinimalPath,
  type RouteAccessProfile,
} from "@/shared/lib/rbac/routes";
import type { Database } from "@/shared/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type AccountRequestRow = Database["public"]["Tables"]["account_requests"]["Row"];
type AdminProfileRow = Database["public"]["Tables"]["admin_profiles"]["Row"];

type MiddlewareProfileRow = Pick<ProfileRow, "role" | "deactivated_at"> & {
  account_requests: Pick<AccountRequestRow, "approval_status"> | null;
  admin_profiles: Pick<AdminProfileRow, "department"> | null;
};

const MIDDLEWARE_PROFILE_SELECT =
  "role, deactivated_at, account_requests!account_requests_profile_id_fkey(approval_status), admin_profiles!admin_profiles_profile_id_fkey(department)";

function toRouteAccessProfile(row: MiddlewareProfileRow): RouteAccessProfile {
  return {
    role: row.role,
    admin_department: getAdminDepartment(
      row.role,
      row.admin_profiles?.department ?? null,
    ),
    approval_status: getEffectiveApprovalStatus(
      row.role,
      row.account_requests?.approval_status ?? null,
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
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    // A transient auth-server failure is not a sign-out: fail open and let
    // the page/action-level auth checks decide, instead of bouncing a
    // signed-in user back to the login page.
    const transientAuthFailure =
      userError !== null &&
      userError !== undefined &&
      (userError.name === "AuthRetryableFetchError" ||
        (userError.status ?? 0) >= 500);

    if (transientAuthFailure) {
      return response;
    }

    if (isProtectedPath(pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
  }

  // Route gating below only applies to auth pages and protected pages.
  // Everything else (public pages, /api/* — routes re-derive the actor
  // themselves) skips the profile lookup entirely.
  if (!isAuthPath(pathname) && !isProtectedPath(pathname)) {
    return response;
  }

  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select(MIDDLEWARE_PROFILE_SELECT)
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return response;
  }

  const accessRow = profileRow as MiddlewareProfileRow | null;

  // A deactivated account keeps a valid token until it expires; treat it as
  // signed out so it can only reach the login page.
  if (accessRow?.deactivated_at) {
    return isProtectedPath(pathname)
      ? NextResponse.redirect(new URL("/login", request.url))
      : response;
  }

  const profile = accessRow ? toRouteAccessProfile(accessRow) : null;

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

  if (
    profile.role === "superadmin" &&
    isProtectedPath(pathname) &&
    !isSuperadminMinimalPath(pathname)
  ) {
    const { data: setting } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", APP_SETTING_KEYS.superadminFullNavigation)
      .maybeSingle();

    if (setting?.value !== true) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}
