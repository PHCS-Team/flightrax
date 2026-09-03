import { PageHeader } from "@/shared/components/layout/page-header";
import type { CredentialAccess } from "@/shared/types/credential-access";
import { InstructorsClientSurface } from "@/modules/instructors/components/instructors-client-surface";

export function InstructorsPage({
  canManageAvailability,
  credentialAccess,
  showPeerPrivacyNote,
  viewerId,
}: {
  canManageAvailability: boolean;
  credentialAccess: CredentialAccess;
  showPeerPrivacyNote: boolean;
  viewerId: string | null;
}) {
  return (
    <section>
      <PageHeader
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/instructors", label: "Instructors" },
        ]}
        title="Instructors"
      />

      <InstructorsClientSurface
        canManageAvailability={canManageAvailability}
        credentialAccess={credentialAccess}
        showPeerPrivacyNote={showPeerPrivacyNote}
        viewerId={viewerId}
      />
    </section>
  );
}
