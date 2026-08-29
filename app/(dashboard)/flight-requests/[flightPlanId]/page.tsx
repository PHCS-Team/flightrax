import { FlightRequestReviewPage } from "@/modules/flight-documents/components/flight-request-review-page";

export default async function Page({
  params,
}: {
  params: Promise<{ flightPlanId: string }>;
}) {
  const { flightPlanId } = await params;

  return <FlightRequestReviewPage flightPlanId={flightPlanId} />;
}
