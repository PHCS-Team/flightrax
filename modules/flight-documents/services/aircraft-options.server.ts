import "server-only";

import type {
  FlightPlanAircraftOption,
  FlightPlanTypeOption,
} from "@/modules/flight-documents/types/aircraft-option";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import { AIRCRAFT_PHOTOS_BUCKET } from "@/shared/lib/storage/buckets";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import type { PaginatedResponse } from "@/shared/types/pagination";

function getUnavailableReason(row: {
  has_wb_config: boolean;
  has_type_specs: boolean;
  has_active_flight: boolean;
}): string | null {
  if (row.has_active_flight) {
    return "In flight";
  }

  if (!row.has_wb_config || !row.has_type_specs) {
    return "Needs admin setup";
  }

  return null;
}

export async function getFlightPlanAircraftOptionsPage(
  page: number,
  pageSize: number,
  search: string,
  typeKey?: string,
): Promise<PaginatedResponse<FlightPlanAircraftOption>> {
  const viewer = await getCurrentAuthorizationProfile();

  if (!viewer || !isApproved(viewer)) {
    throw new Error("You do not have permission to file flight plans.");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc(
    "get_flight_plan_aircraft_options",
    {
      p_page: page,
      p_page_size: pageSize,
      p_search: search.trim() || undefined,
      p_type_key: typeKey || undefined,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  const totalCount = rows.length > 0 ? Number(rows[0].total_count) : 0;
  const storage = supabase.storage.from(AIRCRAFT_PHOTOS_BUCKET);

  return {
    data: rows.map((row) => ({
      id: row.id,
      aircraftIdentification: row.aircraft_identification,
      model: row.model,
      typeKey: row.type_key,
      typeName: row.type_name,
      colorMarkings: row.color_markings,
      photoUrl: row.photo_path
        ? storage.getPublicUrl(row.photo_path).data.publicUrl
        : null,
      isAvailable: row.is_available,
      unavailableReason: getUnavailableReason(row),
    })),
    totalCount,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
  };
}

export async function getFlightPlanAircraft(
  aircraftId: string,
): Promise<FlightPlanAircraftOption | null> {
  const viewer = await getCurrentAuthorizationProfile();

  if (!viewer || !isApproved(viewer)) {
    throw new Error("You do not have permission to file flight plans.");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("aircrafts")
    .select(
      "id, aircraft_identification, model, aircraft_type, color_markings, photo_path, aircraft_types!inner(type)",
    )
    .eq("id", aircraftId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const storage = supabase.storage.from(AIRCRAFT_PHOTOS_BUCKET);

  return {
    id: data.id,
    aircraftIdentification: data.aircraft_identification,
    model: data.model,
    typeKey: data.aircraft_type,
    typeName: data.aircraft_types.type,
    colorMarkings: data.color_markings,
    photoUrl: data.photo_path
      ? storage.getPublicUrl(data.photo_path).data.publicUrl
      : null,
    isAvailable: true,
    unavailableReason: null,
  };
}

export async function getFlightPlanTypeOptions(): Promise<
  FlightPlanTypeOption[]
> {
  const viewer = await getCurrentAuthorizationProfile();

  if (!viewer || !isApproved(viewer)) {
    throw new Error("You do not have permission to file flight plans.");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("aircrafts")
    .select("aircraft_type, aircraft_types!inner(type)")
    .eq("status", "active");

  if (error) {
    throw new Error(error.message);
  }

  const uniqueTypes = new Map<string, FlightPlanTypeOption>();

  for (const row of data ?? []) {
    if (!uniqueTypes.has(row.aircraft_type)) {
      uniqueTypes.set(row.aircraft_type, {
        typeKey: row.aircraft_type,
        type: row.aircraft_types.type,
      });
    }
  }

  return Array.from(uniqueTypes.values()).sort((a, b) =>
    a.type.localeCompare(b.type),
  );
}
