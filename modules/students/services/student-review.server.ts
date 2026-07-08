import "server-only";

import { APPROVAL_STATUS, hasPermission } from "@/shared/lib/rbac/config";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { STUDENT_DOCUMENT_BUCKET } from "@/shared/lib/storage/buckets";
import type {
  StudentReviewItem,
  StudentReviewRow,
} from "@/modules/students/types/student-review";

async function getSignedDocumentUrl(path: string | null) {
  if (!path) {
    return null;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(STUDENT_DOCUMENT_BUCKET)
    .createSignedUrl(path, 60 * 10);

  if (error) {
    return null;
  }

  return data.signedUrl;
}

export async function getStudentReviewItems(): Promise<StudentReviewItem[]> {
  const viewer = await getCurrentAuthorizationProfile();

  if (
    !viewer ||
    !isApproved(viewer) ||
    !hasPermission(viewer.role, "students.review", viewer.admin_department)
  ) {
    throw new Error("You do not have permission to review students.");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("student_profiles")
    .select("approval_status, id_document_content_type, id_document_path, id_document_size_bytes, id_document_uploaded_at, profile_id, rejected_at, rejection_reason, student_id_number, submitted_at, profiles!student_profiles_profile_id_fkey(email, full_name, created_at)")
    .not("submitted_at", "is", null)
    .in("approval_status", [APPROVAL_STATUS.PENDING, APPROVAL_STATUS.REJECTED])
    .order("submitted_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = data satisfies StudentReviewRow[];

  return Promise.all(
    rows.map(async (row) => ({
      id: row.profile_id,
      email: row.profiles?.email ?? "Unknown email",
      fullName: row.profiles?.full_name ?? "Unknown student",
      studentIdNumber: row.student_id_number ?? "Missing ID number",
      approvalStatus: row.approval_status,
      documentUrl: await getSignedDocumentUrl(row.id_document_path),
      documentContentType: row.id_document_content_type,
      documentSizeBytes: row.id_document_size_bytes,
      documentUploadedAt: row.id_document_uploaded_at,
      rejectionReason: row.rejection_reason,
      rejectedAt: row.rejected_at,
      submittedAt: row.submitted_at,
      createdAt: row.profiles?.created_at ?? row.submitted_at ?? "",
    })),
  );
}
