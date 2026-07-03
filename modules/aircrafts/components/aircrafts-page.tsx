import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { PageHeader } from "@/shared/components/layout/page-header";

const aircrafts = ["RP-C218", "RP-C642", "RP-C904"];

export function AircraftsPage() {
  return (
    <section className="space-y-6 py-2">
      <PageHeader
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/aircrafts", label: "Aircrafts" },
        ]}
        title="Fleet readiness board"
      />

      <div className="grid gap-4 md:grid-cols-3">
        {aircrafts.map((tailNumber) => (
          <Card key={tailNumber}>
            <CardHeader>
              <CardTitle>{tailNumber}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Training aircraft placeholder</p>
              <p>Next check: 36h</p>
              <Badge variant="outline">Ready</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
