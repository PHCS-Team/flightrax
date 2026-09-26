import { PageHeader } from "@/shared/components/layout/page-header";
import { AdminsClientSurface } from "@/modules/admins/components/admins-client-surface";

export function AdminsPage() {
  return (
    <section>
      <PageHeader
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/admins", label: "Admins" },
        ]}
        title="Admins"
      />

      <AdminsClientSurface />
    </section>
  );
}
