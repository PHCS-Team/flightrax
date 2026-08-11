import { NextResponse } from "next/server";

import { getAccountReviewItems } from "@/modules/account-review/services/account-review.server";
import { ACCOUNT_REQUEST_ROLES } from "@/shared/lib/rbac/config";
import type { AccountRequestRole } from "@/shared/lib/rbac/config";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get("type");
  const type = (ACCOUNT_REQUEST_ROLES as readonly string[]).includes(
    typeParam ?? "",
  )
    ? (typeParam as AccountRequestRole)
    : ACCOUNT_REQUEST_ROLES[0];

  try {
    const requests = await getAccountReviewItems(type);

    return NextResponse.json(requests);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load account review requests.";
    const status = message.includes("permission") ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}
