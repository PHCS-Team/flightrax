import { NextResponse } from "next/server";

import { getOwnLicenses } from "@/modules/auth/services/licenses.server";

export async function GET() {
  try {
    const licenses = await getOwnLicenses();

    return NextResponse.json(licenses);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load licenses.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
