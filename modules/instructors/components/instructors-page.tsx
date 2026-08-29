import { PageHeader } from "@/shared/components/layout/page-header";
import { InstructorsClientSurface } from "@/modules/instructors/components/instructors-client-surface";

export function InstructorsPage({
  canManageAvailability,
  restrictPeerCredentials,
  showPeerPrivacyNote,
  viewerId,
}: {
  canManageAvailability: boolean;
  restrictPeerCredentials: boolean;
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
        restrictPeerCredentials={restrictPeerCredentials}
        showPeerPrivacyNote={showPeerPrivacyNote}
        viewerId={viewerId}
      />
    </section>
  );
}
