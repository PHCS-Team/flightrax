import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

const aircraft = ["RP-C218", "RP-C642", "RP-C904"];

export function AircraftPage() {
  return (
    <section className="space-y-6 py-2">
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <Badge variant="secondary">Aircraft</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Fleet readiness</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Static fleet cards for future aircraft records, utilization, documents,
          and maintenance windows.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {aircraft.map((tailNumber) => (
          <Card key={tailNumber}>
            <CardHeader>
              <CardTitle>{tailNumber}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Airbus A320 placeholder</p>
              <p>Next check: 36h</p>
              <Badge variant="outline">Ready</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
