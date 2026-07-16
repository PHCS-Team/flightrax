import { NextResponse } from "next/server";

import { getStudentDocumentSignedUrl } from "@/modules/students/services/student-review.server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const documentUrl = await getStudentDocumentSignedUrl(id);

  if (documentUrl === null) {
    return NextResponse.json(
      { message: "Document not found or access denied." },
      { status: 404 },
    );
  }

  return NextResponse.json({ documentUrl });
}
