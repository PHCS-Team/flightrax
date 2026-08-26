import { WeightBalancePage } from "@/modules/flight-documents/components/weight-balance-page";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <WeightBalancePage flightPlanId={id} />;
}
