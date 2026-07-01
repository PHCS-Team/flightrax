import {
  ActivityIcon,
  ClockIcon,
  PlaneIcon,
  ShieldCheckIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { PageHeader } from "@/shared/components/layout/page-header";

const metrics = [
  {
    label: "Active flights",
    value: "42",
    note: "Across 7 sectors",
    icon: PlaneIcon,
  },
  {
    label: "On-time rate",
    value: "94%",
    note: "Static target",
    icon: ClockIcon,
  },
  {
    label: "Ops alerts",
    value: "3",
    note: "Awaiting realtime",
    icon: ActivityIcon,
  },
  {
    label: "Crew ready",
    value: "128",
    note: "Roster placeholder",
    icon: ShieldCheckIcon,
  },
];

export function DashboardPage() {
  return (
    <section>
      <PageHeader
        breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }]}
        title="Flight Status"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card key={metric.label}>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </CardTitle>
                <Icon className="size-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{metric.value}</div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {metric.note}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
