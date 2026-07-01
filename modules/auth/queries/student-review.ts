import { APPROVAL_STATUS } from "@/shared/lib/rbac/config";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import type { ApprovalStatus } from "@/shared/lib/rbac/types";
import type { Database } from "@/shared/types/supabase";
import { STUDENT_DOCUMENT_BUCKET } from "@/modules/auth/utils/student-document";

type StudentProfileRow = Database["public"]["Tables"]["student_profiles"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

type StudentReviewRow = Pick<
  StudentProfileRow,
  | "approval_status"
  | "id_document_content_type"
  | "id_document_path"
  | "id_document_size_bytes"
  | "id_document_uploaded_at"
  | "profile_id"
  | "rejected_at"
  | "rejection_reason"
  | "student_id_number"
  | "submitted_at"
> & {
  profiles: Pick<ProfileRow, "email" | "full_name" | "created_at"> | null;
};

export type StudentReviewItem = {
  id: string;
  email: string;
  fullName: string;
  studentIdNumber: string;
  approvalStatus: ApprovalStatus;
  documentUrl: string | null;
  documentContentType: string | null;
  documentSizeBytes: number | null;
  documentUploadedAt: string | null;
  rejectionReason: string | null;
  rejectedAt: string | null;
  submittedAt: string | null;
  createdAt: string;
};

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

export async function getStudentReviewItems() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("student_profiles")
    .select("approval_status, id_document_content_type, id_document_path, id_document_size_bytes, id_document_uploaded_at, profile_id, rejected_at, rejection_reason, student_id_number, submitted_at, profiles!student_profiles_profile_id_fkey(email, full_name, created_at)")
    .not("submitted_at", "is", null)
    .eq("approval_status", APPROVAL_STATUS.PENDING)
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
