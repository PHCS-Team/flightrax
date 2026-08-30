import { getNotamsPage } from "@/modules/notams/services/notams.server";

type SeverityFilter = "" | "advisory" | "warning" | "alert";
type ExpiryFilter = "" | "active" | "expired" | "no_expiry";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)));
  const search = searchParams.get("search") ?? "";
  const severity = (searchParams.get("severity") ?? "") as SeverityFilter;
  const expiry = (searchParams.get("expiry") ?? "") as ExpiryFilter;

  try {
    const data = await getNotamsPage(page, pageSize, search, severity, expiry);
    return Response.json(data);
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : "Failed to fetch NOTAMs" },
      { status: 500 },
    );
  }
}