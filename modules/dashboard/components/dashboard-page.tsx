import type { ReactNode } from "react";

import { FlightOperationsHome } from "@/modules/dashboard/components/flight-operations-home";
import { FlightStatusClientSurface } from "@/modules/dashboard/components/flight-status-client-surface";
import { OrganizedFlightStatusClientSurface } from "@/modules/dashboard/components/organized-flight-status-client-surface";
import { getDashboardHomeSurface } from "@/modules/dashboard/utils/home-surface";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";

export async function DashboardPage({
  aircraftsSurface,
}: {
  aircraftsSurface: ReactNode;
}) {
  const profile = await getCurrentAuthorizationProfile();
  const surface = getDashboardHomeSurface(profile);

  if (surface === "aircrafts") {
    return <FlightOperationsHome>{aircraftsSurface}</FlightOperationsHome>;
  }

  if (surface === "organized-board") {
    return <OrganizedFlightStatusClientSurface />;
  }

  return <FlightStatusClientSurface />;
}
