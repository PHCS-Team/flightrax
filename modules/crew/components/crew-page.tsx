import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

const teams = ["Flight deck", "Cabin crew", "Reserve pool", "Dispatch"];

export function CrewPage() {
  return (
    <section className="space-y-6 py-2">
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <Badge variant="secondary">Crew</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Roster command</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Static crew grouping for future profiles, qualifications, rest windows,
          and assignment workflows.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {teams.map((team) => (
          <Card key={team}>
            <CardHeader>
              <CardTitle>{team}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">24</div>
              <p className="mt-2 text-sm text-muted-foreground">Static personnel count</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
