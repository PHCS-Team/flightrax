import { AlertTriangleIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { PageHeader } from "@/shared/components/layout/page-header";

const notams = [
  ["Runway lighting", "Maintenance advisory for evening operations"],
  ["Training area", "Altitude restriction near western practice sector"],
  ["Tower frequency", "Monitor alternate frequency during drill window"],
];

export function NotamsPage() {
  return (
    <section className="space-y-6 py-2">
      <PageHeader
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/notams", label: "NOTAMs" },
        ]}
        title="Notice board"
      />

      <div className="grid gap-4">
        {notams.map(([title, description]) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <CardTitle>{title}</CardTitle>
              <AlertTriangleIcon className="size-5 text-warning" />
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {description}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
