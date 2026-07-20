"use server";

import { createAircraftTypeSchema } from "@/modules/aircrafts/schemas/aircraft-type-schema";
import { canManageAircrafts } from "@/modules/aircrafts/utils/aircraft-permissions";
import { generateAircraftTypeKey } from "@/modules/aircrafts/utils/aircraft-type-key";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const createAircraftTypeAction = actionClient
  .inputSchema(createAircraftTypeSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (!canManageAircrafts(actor)) {
      return { ok: false, message: "You do not have permission to manage aircraft types." };
    }

    const typeKey = generateAircraftTypeKey(parsedInput.type);

    if (!typeKey) {
      return { ok: false, message: "Aircraft type name must contain at least one alphanumeric character." };
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("aircraft_types").insert({
      type_key: typeKey,
      type: parsedInput.type,
    });

    if (error) {
      if (error.code === "23505") {
        return { ok: false, message: `Aircraft type "${parsedInput.type}" already exists.` };
      }

      return { ok: false, message: error.message };
    }

    return { ok: true, message: "Aircraft type created." };
  });
