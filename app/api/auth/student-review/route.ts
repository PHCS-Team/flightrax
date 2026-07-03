import { NextResponse } from "next/server";

import { getStudentReviewItems } from "@/modules/auth/services/student-review.server";

export async function GET() {
  try {
    const students = await getStudentReviewItems();

    return NextResponse.json(students);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load student review requests.";
    const status = message.includes("permission") ? 403 : 500;

    return NextResponse.json({ message }, { status });
  }
}
