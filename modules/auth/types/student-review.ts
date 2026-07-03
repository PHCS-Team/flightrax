import type { ApprovalStatus } from "@/shared/lib/rbac/types";

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
