import { FlightPlanEditClientSurface } from "@/modules/flight-documents/components/flight-plan-edit-client-surface";

export function FlightPlanEditPage({ flightPlanId }: { flightPlanId: string }) {
  return (
    <section>
      <FlightPlanEditClientSurface flightPlanId={flightPlanId} />
    </section>
  );
}
