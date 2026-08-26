import { format } from "date-fns";

// Flight plan code: FP-YYMMDD-XXXX — filing date plus 4 random digits.
// Uniqueness is enforced by the flight_plans_plan_code_key constraint;
// the create action retries on the rare same-day collision.
export function generatePlanCode(): string {
  const digits = String(Math.floor(Math.random() * 10000)).padStart(4, "0");

  return `FP-${format(new Date(), "yyMMdd")}-${digits}`;
}
