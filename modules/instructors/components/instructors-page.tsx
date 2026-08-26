import { PageHeader } from "@/shared/components/layout/page-header";
import { InstructorsClientSurface } from "@/modules/instructors/components/instructors-client-surface";

export function InstructorsPage({
  restrictPeerCredentials,
  showPeerPrivacyNote,
  viewerId,
}: {
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
        restrictPeerCredentials={restrictPeerCredentials}
        showPeerPrivacyNote={showPeerPrivacyNote}
        viewerId={viewerId}
      />
    </section>
  );
}
