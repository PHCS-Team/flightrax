import { FlightLogPage } from "@/modules/flight-documents/components/flight-log-page";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <FlightLogPage context="flight-plans" flightPlanId={id} />;
}
