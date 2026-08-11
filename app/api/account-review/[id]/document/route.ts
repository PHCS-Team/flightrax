import { NextResponse } from "next/server";

import { getAccountDocumentSignedUrl } from "@/modules/account-review/services/account-review.server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const documentUrl = await getAccountDocumentSignedUrl(id);

  if (documentUrl === null) {
    return NextResponse.json(
      { message: "Document not found or access denied." },
      { status: 404 },
    );
  }

  return NextResponse.json({ documentUrl });
}
