"use client";

import { NotamForm } from "@/modules/notams/components/notam-form";
import { NotamsClientSurface } from "@/modules/notams/components/notams-client-surface";
import { PageHeader } from "@/shared/components/layout/page-header";

export function NotamsPage() {
  return (
    <section>
      <PageHeader
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/notams", label: "NOTAMs" },
        ]}
        title="NOTAMs"
      />

      <div className="space-y-6">
        <NotamForm onSuccess={() => window.location.reload()} />
        <NotamsClientSurface />
      </div>
    </section>
  );
}