import { BadgeCheckIcon } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { PageHeader } from "@/shared/components/layout/page-header";

const instructors = [
  ["Capt. Reyes", "Instrument rating", "Available today"],
  ["Capt. Santos", "Multi-engine", "Ground school"],
  ["Capt. Lim", "Check ride prep", "Afternoon slots"],
];

export function InstructorsPage() {
  return (
    <section className="space-y-6 py-2">
      <PageHeader
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/instructors", label: "Instructors" },
        ]}
        title="Instructor roster"
      />

      <div className="grid gap-4 md:grid-cols-3">
        {instructors.map(([name, specialty, status]) => (
          <Card key={name}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <CardTitle>{name}</CardTitle>
              <BadgeCheckIcon className="size-5 text-success" />
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{specialty}</p>
              <Badge variant="outline">{status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
