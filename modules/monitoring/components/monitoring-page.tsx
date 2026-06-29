import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

const signals = ["ATC flow", "Weather cells", "Delay risk", "Ground handling"];

export function MonitoringPage() {
  return (
    <section className="space-y-6 py-2">
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <Badge variant="secondary">Monitoring</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Realtime watchlist</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Static signal grid for future Supabase realtime subscriptions and alert
          routing.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {signals.map((signal, index) => (
          <Card key={signal}>
            <CardHeader>
              <CardTitle>{signal}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-3 rounded-full bg-muted">
                <div
                  className="h-3 rounded-full bg-primary"
                  style={{ width: `${42 + index * 12}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Nominal static feed</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
