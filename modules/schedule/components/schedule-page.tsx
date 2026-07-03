import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { PageHeader } from "@/shared/components/layout/page-header";

const scheduleWindows = [
  ["Morning block", "Preflight checks", "06:00-10:00"],
  ["Midday block", "Pattern work", "10:00-14:00"],
  ["Afternoon block", "Cross-country", "14:00-18:00"],
];

export function SchedulePage() {
  return (
    <section className="space-y-6 py-2">
      <PageHeader
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/schedule", label: "Schedule" },
        ]}
        title="Flight training timetable"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {scheduleWindows.map(([windowName, focus, timeRange]) => (
          <Card key={windowName}>
            <CardHeader>
              <CardTitle>{windowName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge variant="outline">{timeRange}</Badge>
              <p className="text-sm text-muted-foreground">{focus}</p>
              <div className="rounded-2xl border bg-muted/40 p-3 text-sm">
                Assignment placeholder
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
