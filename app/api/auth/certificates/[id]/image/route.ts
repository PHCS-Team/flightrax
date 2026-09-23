import { NextResponse } from "next/server";

import { getCertificateImageSignedUrls } from "@/modules/auth/services/certificates.server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const images = await getCertificateImageSignedUrls(id);

  if (images === null) {
    return NextResponse.json(
      { message: "Certificate not found or access denied." },
      { status: 404 },
    );
  }

  return NextResponse.json(images);
}
