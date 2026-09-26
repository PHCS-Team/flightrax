import { NextResponse } from "next/server";

import { getAppSettings } from "@/shared/lib/app-settings.server";

export async function GET() {
  const settings = await getAppSettings();

  return NextResponse.json(settings);
}
