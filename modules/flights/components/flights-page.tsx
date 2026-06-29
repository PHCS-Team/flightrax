import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";

const flights = [
  ["FRX 218", "Manila", "Tokyo", "Boarding", "09:40"],
  ["FRX 642", "Cebu", "Singapore", "Taxi", "10:15"],
  ["FRX 904", "Davao", "Seoul", "Scheduled", "11:05"],
];

export function FlightsPage() {
  return (
    <section className="space-y-6 py-2">
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <Badge variant="secondary">Flight registry</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Flight board</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Static operational board for planned database-backed flight records,
          assignments, and realtime status updates.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming sectors</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flight</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>ETD</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flights.map(([flight, origin, destination, status, etd]) => (
                <TableRow key={flight}>
                  <TableCell className="font-medium">{flight}</TableCell>
                  <TableCell>{origin}</TableCell>
                  <TableCell>{destination}</TableCell>
                  <TableCell>{status}</TableCell>
                  <TableCell>{etd}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
