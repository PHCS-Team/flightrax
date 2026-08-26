import { ClipboardCheckIcon } from "lucide-react";

import { EmptyState } from "@/shared/components/layout/empty-state";
import { PageHeader } from "@/shared/components/layout/page-header";

// Static placeholder — the instructor review flow (pending queue,
// approve/reject actions) lands here in the next phase.
export function FlightRequestsPage() {
  return (
    <section>
      <PageHeader
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/flight-requests", label: "Flight Requests" },
        ]}
        title="Flight Requests"
      />

      <EmptyState
        description="Flight requests submitted for approval will appear here for review."
        icon={<ClipboardCheckIcon className="size-7" />}
        title="Flight Request Review"
      />
    </section>
  );
}
