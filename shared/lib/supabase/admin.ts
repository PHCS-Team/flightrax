import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { getSupabaseAdminConfig } from "@/shared/lib/supabase/config";
import type { Database } from "@/shared/types/supabase";

export function createAdminClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseAdminConfig();

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
