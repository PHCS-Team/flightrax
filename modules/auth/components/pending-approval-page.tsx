import { PendingApprovalClientSurface } from "@/modules/auth/components/pending-approval-client-surface";
import { getCurrentProfile } from "@/modules/auth/queries/profile";

export async function PendingApprovalPage() {
  const profile = await getCurrentProfile();

  return <PendingApprovalClientSurface profile={profile} />;
}
