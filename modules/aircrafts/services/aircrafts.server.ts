import "server-only";

import type { Aircraft } from "@/modules/aircrafts/types/aircraft";
import { AIRCRAFTS_VIEW } from "@/modules/aircrafts/constants/permissions";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { AIRCRAFT_PHOTOS_BUCKET } from "@/shared/lib/storage/buckets";
import type { PaginatedResponse } from "@/shared/types/pagination";

const AIRCRAFT_SELECT =
  "aircraft_identification, aircraft_type, aircraft_types!inner(type), color_markings, created_at, id, model, photo_path, remarks, serial_number, status, updated_at" as const;

async function getMatchingAircraftTypes(
  supabase: ReturnType<typeof createAdminClient>,
  search: string,
): Promise<string[]> {
  const { data } = await supabase
    .from("aircraft_types")
    .select("type_key")
    .ilike("type", `%${search}%`);

  return data?.map((t) => t.type_key) ?? [];
}

function buildSearchFilter(search: string, matchingAircraftTypes: string[]) {
  const filters: string[] = [
    `aircraft_identification.ilike.%${search}%`,
    `model.ilike.%${search}%`,
    `serial_number.ilike.%${search}%`,
  ];

  if (matchingAircraftTypes.length > 0) {
    filters.push(`aircraft_type.in.(${matchingAircraftTypes.join(",")})`);
  }

  return filters.join(",");
}

export async function getAircraftsPage(
  page: number,
  pageSize: number,
  search: string,
  typeFilter?: string,
): Promise<PaginatedResponse<Aircraft>> {
  const viewer = await getCurrentAuthorizationProfile();

  if (
    !viewer ||
    !isApproved(viewer) ||
    !hasPermission(viewer.role, AIRCRAFTS_VIEW, viewer.admin_department)
  ) {
    throw new Error("You do not have permission to view aircraft.");
  }

  const supabase = createAdminClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("aircrafts")
    .select(AIRCRAFT_SELECT, { count: "exact" });

  if (typeFilter) {
    query = query.eq("aircraft_type", typeFilter);
  }

  if (search) {
    const matchingTypes = await getMatchingAircraftTypes(supabase, search);
    query = query.or(buildSearchFilter(search, matchingTypes));
  }

  const {
    data,
    error,
    count: totalCount,
  } = await query
    .order("aircraft_identification", { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const storage = supabase.storage.from(AIRCRAFT_PHOTOS_BUCKET);

  const aircrafts = data.map((row) => {
    const photoUrl = row.photo_path
      ? storage.getPublicUrl(row.photo_path).data.publicUrl
      : null;

    return {
      aircraftIdentification: row.aircraft_identification,
      aircraftType: row.aircraft_type,
      colorMarkings: row.color_markings,
      createdAt: row.created_at,
      id: row.id,
      model: row.model,
      photoPath: row.photo_path,
      photoUrl,
      remarks: row.remarks,
      serialNumber: row.serial_number,
      status: row.status,
      typeName: row.aircraft_types.type,
      updatedAt: row.updated_at,
    };
  });

  return {
    data: aircrafts,
    totalCount: total,
    page,
    pageSize,
    totalPages,
  };
}
