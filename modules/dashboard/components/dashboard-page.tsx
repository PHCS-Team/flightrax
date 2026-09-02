import { FlightStatusClientSurface } from "@/modules/dashboard/components/flight-status-client-surface";
import { OrganizedFlightStatusClientSurface } from "@/modules/dashboard/components/organized-flight-status-client-surface";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { ROLE } from "@/shared/lib/rbac/config";

export async function DashboardPage() {
  const profile = await getCurrentAuthorizationProfile();

  if (profile?.role === ROLE.ADMIN) {
    return <OrganizedFlightStatusClientSurface />;
  }

  return <FlightStatusClientSurface />;
}
