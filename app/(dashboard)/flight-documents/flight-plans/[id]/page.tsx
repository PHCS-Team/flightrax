import { FlightPlanEditPage } from "@/modules/flight-documents/components/flight-plan-edit-page";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <FlightPlanEditPage flightPlanId={id} />;
}
