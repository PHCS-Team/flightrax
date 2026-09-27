import { PageHeader } from "@/shared/components/layout/page-header";
import { AdminsClientSurface } from "@/modules/admins/components/admins-client-surface";
import { CreateAdminAction } from "@/modules/admins/components/create-admin-action";

export function AdminsPage() {
  return (
    <section>
      <PageHeader
        action={<CreateAdminAction />}
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
