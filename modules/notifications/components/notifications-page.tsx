import { MarkAllReadButton } from "@/modules/notifications/components/mark-all-read-button";
import { NotificationsClientSurface } from "@/modules/notifications/components/notifications-client-surface";
import { PageHeader } from "@/shared/components/layout/page-header";

export function NotificationsPage() {
  return (
    <section>
      <PageHeader
        action={<MarkAllReadButton />}
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/notifications", label: "Notifications" },
        ]}
        title="Notifications"
      />

      <NotificationsClientSurface />
    </section>
  );
}
