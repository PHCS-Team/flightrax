import { NextResponse } from "next/server";

import { getLicenseImageSignedUrls } from "@/modules/auth/services/licenses.server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const urls = await getLicenseImageSignedUrls(id);

  if (urls === null) {
    return NextResponse.json(
      { message: "License not found or access denied." },
      { status: 404 },
    );
  }

  return NextResponse.json(urls);
}
