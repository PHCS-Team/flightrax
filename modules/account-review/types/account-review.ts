import type { AccountRequestRole } from "@/shared/lib/rbac/config";
import type { ApprovalStatus } from "@/shared/lib/rbac/types";
import type { Database } from "@/shared/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type AccountRequestRow = Database["public"]["Tables"]["account_requests"]["Row"];

export type AccountReviewItem = {
  id: string;
  email: string;
  fullName: string;
  idNumber: string;
  requestType: AccountRequestRole;
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

export type AccountReviewRow = Pick<
  AccountRequestRow,
  | "approval_status"
  | "id_document_content_type"
  | "id_document_path"
  | "id_document_size_bytes"
  | "id_document_uploaded_at"
  | "id_number"
  | "profile_id"
  | "rejected_at"
  | "rejection_reason"
  | "request_type"
  | "submitted_at"
> & {
  profiles: Pick<ProfileRow, "email" | "full_name" | "created_at"> | null;
};

export type AccountReviewStatusCounts = {
  approved: number;
  pending: number;
  rejected: number;
};

export type AccountReviewMetrics = Record<
  AccountRequestRole,
  AccountReviewStatusCounts
>;
