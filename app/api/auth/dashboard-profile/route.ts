import { NextResponse } from "next/server";

import { getCurrentDashboardProfile } from "@/modules/auth/queries/profile";

export async function GET() {
  const profile = await getCurrentDashboardProfile();

  return NextResponse.json(profile);
}
