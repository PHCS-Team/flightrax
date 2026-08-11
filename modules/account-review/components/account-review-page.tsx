import { AccountReviewClientSurface } from "@/modules/account-review/components/account-review-client-surface";
import { PageHeader } from "@/shared/components/layout/page-header";

export function AccountReviewPage() {
  return (
    <section>
      <PageHeader
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/account-review", label: "Account Review" },
        ]}
        title="Account Requests"
      />

      <AccountReviewClientSurface />
    </section>
  );
}
