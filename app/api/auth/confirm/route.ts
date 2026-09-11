import { NextResponse } from "next/server";

import {
  confirmEmailToken,
  getConfirmDestination,
  isEmailOtpType,
} from "@/modules/auth/services/auth-confirm.server";

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (!tokenHash || !isEmailOtpType(type)) {
    return NextResponse.redirect(
      new URL("/forgot-password?error=invalid-link", origin),
    );
  }

  const result = await confirmEmailToken(tokenHash, type);

  if (!result.ok) {
    return NextResponse.redirect(
      new URL("/forgot-password?error=expired-link", origin),
    );
  }

  return NextResponse.redirect(new URL(getConfirmDestination(type), origin));
}
