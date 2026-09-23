import type { FlightPlanFilerContext } from "@/modules/flight-documents/types/filer-context";
import { describeExpiredCredentials } from "@/shared/lib/aviation/expired-credentials";

type FilerReadiness = Pick<
  FlightPlanFilerContext,
  "expiredCredentials" | "hasSignature" | "hasValidLicense"
>;

export function isFilerReady(context: FilerReadiness) {
  return (
    context.hasSignature &&
    context.hasValidLicense &&
    context.expiredCredentials.length === 0
  );
}

export function describeFilerBlockers(context: FilerReadiness) {
  return [
    !context.hasSignature
      ? "Set your signature — saving a flight plan automatically signs it."
      : null,
    !context.hasValidLicense
      ? "Add an active, non-expired license to your account."
      : null,
    context.expiredCredentials.length > 0
      ? `Renew your expired documents: ${describeExpiredCredentials(context.expiredCredentials)}.`
      : null,
  ].filter((blocker): blocker is string => blocker !== null);
}
