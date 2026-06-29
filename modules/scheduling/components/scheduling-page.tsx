import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

const windows = ["Morning departures", "Afternoon turns", "Night maintenance"];

export function SchedulingPage() {
  return (
    <section className="space-y-6 py-2">
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <Badge variant="secondary">Scheduling</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Rotation planner</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Static planning lanes for aircraft rotations, crew pairings, and gate
          windows.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {windows.map((windowName) => (
          <Card key={windowName}>
            <CardHeader>
              <CardTitle>{windowName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {["FRX 218", "FRX 642", "FRX 904"].map((flight) => (
                <div key={flight} className="rounded-2xl border bg-muted/40 p-3 text-sm">
                  {flight} assignment placeholder
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
