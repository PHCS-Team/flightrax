import "server-only";

import { cache } from "react";

import { toAppSettings, type AppSettings } from "@/shared/lib/app-settings";
import { createClient } from "@/shared/lib/supabase/server";
import { describeActionError } from "@/shared/lib/action-error";

export const getAppSettings = cache(async function getAppSettings(): Promise<
  AppSettings
> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("app_settings").select("key, value");

  if (error) {
    throw new Error(describeActionError(error));
  }

  return toAppSettings(data);
});
