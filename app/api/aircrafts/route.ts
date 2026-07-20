import { NextResponse } from "next/server";

import { getAircraftsPage } from "@/modules/aircrafts/services/aircrafts.server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("pageSize") ?? "10", 10)),
    );
    const search = searchParams.get("search") ?? "";
    const typeFilter = searchParams.get("type") ?? "";

    const result = await getAircraftsPage(page, pageSize, search, typeFilter || undefined);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load aircraft.";
    const status = message.includes("permission") ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}
