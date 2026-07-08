import type { ApprovalStatus } from "@/shared/lib/rbac/types";
import type { Database } from "@/shared/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type StudentProfileRow = Database["public"]["Tables"]["student_profiles"]["Row"];

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

export type StudentReviewRow = Pick<
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
