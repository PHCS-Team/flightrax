import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { getSupabaseConfig } from "@/shared/lib/supabase/config";
import { APPROVAL_STATUS } from "@/shared/lib/rbac/config";
import { normalizeProfile } from "@/shared/lib/rbac/profile";
import {
  canAccessPath,
  getDefaultRedirectForProfile,
  isAuthPath,
  isProtectedPath,
} from "@/shared/lib/rbac/routes";
import type { Database } from "@/shared/types/supabase";

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
  const profile = profileRow ? normalizeProfile(profileRow) : null;

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
