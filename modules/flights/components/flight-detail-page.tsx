import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

const checkpoints = ["Dispatch release", "Crew briefing", "Fuel order", "Gate readiness"];

export function FlightDetailPage() {
  return (
    <section className="space-y-6 py-2">
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <Badge variant="secondary">Flight detail</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">FRX 218</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Placeholder detail surface for route, crew, aircraft, documents, and
          realtime operations logs.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {checkpoints.map((checkpoint) => (
          <Card key={checkpoint}>
            <CardHeader>
              <CardTitle className="text-base">{checkpoint}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Static readiness card awaiting Supabase records and actions.
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
