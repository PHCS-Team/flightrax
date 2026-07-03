import { FileCheckIcon, FileClockIcon, FileWarningIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { PageHeader } from "@/shared/components/layout/page-header";

const documentGroups = [
  {
    icon: FileCheckIcon,
    label: "Current clearances",
    note: "Medical certificates, student permits, and dispatch releases ready for review.",
    value: "18",
  },
  {
    icon: FileClockIcon,
    label: "Expiring soon",
    note: "Documents that need renewal before the next training window.",
    value: "6",
  },
  {
    icon: FileWarningIcon,
    label: "Needs attention",
    note: "Missing signatures or uploads awaiting instructor verification.",
    value: "3",
  },
];

export function FlightDocumentsPage() {
  return (
    <section className="space-y-6 py-2">
      <PageHeader
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/flight-documents", label: "Flight Documents" },
        ]}
        title="Training paperwork console"
      />

      <div className="grid gap-4 md:grid-cols-3">
        {documentGroups.map((group) => {
          const Icon = group.icon;

          return (
            <Card key={group.label}>
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <CardTitle>{group.label}</CardTitle>
                <Icon className="size-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{group.value}</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {group.note}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
