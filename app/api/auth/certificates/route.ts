import { NextResponse } from "next/server";

import { getOwnCertificates } from "@/modules/auth/services/certificates.server";

export async function GET() {
  try {
    const certificates = await getOwnCertificates();

    return NextResponse.json(certificates);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load certificates.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
