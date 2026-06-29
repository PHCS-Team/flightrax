import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "@/shared/lib/supabase/config";
import type { Database } from "@/shared/types/supabase";

export function createClient() {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig();

  return createBrowserClient<Database>(supabaseUrl, supabasePublishableKey);
}
