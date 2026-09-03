import { NotamsClientSurface } from "@/modules/notams/components/notams-client-surface";
import { PageHeader } from "@/shared/components/layout/page-header";

export function NotamsPage({
  canDeleteAny,
  viewerId,
}: {
  canDeleteAny: boolean;
  viewerId: string | null;
}) {
  return (
    <section>
      <PageHeader
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/notams", label: "NOTAMs" },
        ]}
        title="NOTAMs"
      />

      <NotamsClientSurface canDeleteAny={canDeleteAny} viewerId={viewerId} />
    </section>
  );
}
