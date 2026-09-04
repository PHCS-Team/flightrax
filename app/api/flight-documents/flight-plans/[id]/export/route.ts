import { NextResponse } from "next/server";

import { getFlightDocumentsExport } from "@/modules/flight-documents/services/flight-documents-export.server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const documents = await getFlightDocumentsExport(id);

    if (!documents) {
      return NextResponse.json(
        { message: "This flight plan does not exist or you cannot view it." },
        { status: 404 },
      );
    }

    return NextResponse.json(documents);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load flight documents.";
    const status = message.includes("permission") ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}
