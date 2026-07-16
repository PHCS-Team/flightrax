import { AccountClientSurface } from "@/modules/auth/components/account-client-surface";
import { ChangePasswordDialog } from "@/modules/auth/components/change-password-dialog";
import { LogoutConfirmationButton } from "@/modules/auth/components/logout-confirmation-button";
import { PageHeader } from "@/shared/components/layout/page-header";

export function AccountPage() {
  return (
    <section>
      <PageHeader
        action={
          <div className="flex items-center gap-2">
            <ChangePasswordDialog />
            <LogoutConfirmationButton buttonClassName="rounded-lg sm:rounded-2xl" />
          </div>
        }
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/account", label: "My Account" },
        ]}
        title="My Account"
      />

      <AccountClientSurface />
    </section>
  );
}
