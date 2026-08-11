import { NextResponse } from "next/server";

import { getCertificateImageSignedUrl } from "@/modules/auth/services/certificates.server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const imageUrl = await getCertificateImageSignedUrl(id);

  if (imageUrl === null) {
    return NextResponse.json(
      { message: "Certificate not found or access denied." },
      { status: 404 },
    );
  }

  return NextResponse.json(imageUrl);
}
