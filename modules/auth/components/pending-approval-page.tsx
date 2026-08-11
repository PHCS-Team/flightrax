import { PendingApprovalClientSurface } from "@/modules/auth/components/pending-approval-client-surface";
import { getCurrentProfile } from "@/modules/auth/queries/profile";
import { getOwnAccountDocumentUrl } from "@/modules/auth/services/account-request.server";
import { APPROVAL_STATUS } from "@/shared/lib/rbac/config";

export async function PendingApprovalPage() {
  const profile = await getCurrentProfile();
  const currentDocumentUrl =
    profile?.approval_status === APPROVAL_STATUS.REJECTED
      ? await getOwnAccountDocumentUrl(profile.id_document_path)
      : null;

  return (
    <PendingApprovalClientSurface
      currentDocumentUrl={currentDocumentUrl}
      profile={profile}
    />
  );
}
