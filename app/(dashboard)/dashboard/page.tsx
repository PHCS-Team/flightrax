import { AircraftsClientSurface } from "@/modules/aircrafts/components/aircrafts-client-surface";
import { DashboardPage } from "@/modules/dashboard/components/dashboard-page";

export default function Page() {
  return <DashboardPage aircraftsSurface={<AircraftsClientSurface />} />;
}
