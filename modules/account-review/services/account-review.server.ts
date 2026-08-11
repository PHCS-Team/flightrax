import "server-only";

import { ACCOUNT_REVIEW } from "@/modules/account-review/constants/permissions";
import {
  ACCOUNT_REQUEST_ROLES,
  APPROVAL_STATUS,
  hasPermission,
  type AccountRequestRole,
} from "@/shared/lib/rbac/config";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { ACCOUNT_DOCUMENT_BUCKET } from "@/shared/lib/storage/buckets";
import type {
  AccountReviewItem,
  AccountReviewMetrics,
  AccountReviewRow,
  AccountReviewStatusCounts,
} from "@/modules/account-review/types/account-review";

async function assertReviewer() {
  const viewer = await getCurrentAuthorizationProfile();

  if (
    !viewer ||
    !isApproved(viewer) ||
    !hasPermission(viewer.role, ACCOUNT_REVIEW, viewer.admin_department)
  ) {
    throw new Error("You do not have permission to review account requests.");
  }
}

export async function getAccountReviewItems(
  type: AccountRequestRole,
): Promise<AccountReviewItem[]> {
  await assertReviewer();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("account_requests")
    .select(
      "approval_status, id_document_content_type, id_document_path, id_document_size_bytes, id_document_uploaded_at, id_number, profile_id, rejected_at, rejection_reason, request_type, submitted_at, profiles!account_requests_profile_id_fkey(email, full_name, created_at)",
    )
    .eq("request_type", type)
    .not("submitted_at", "is", null)
    .in("approval_status", [APPROVAL_STATUS.PENDING, APPROVAL_STATUS.REJECTED])
    .order("submitted_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = data satisfies AccountReviewRow[];

  return rows.map((row) => ({
    id: row.profile_id,
    email: row.profiles?.email ?? "Unknown email",
    fullName: row.profiles?.full_name ?? "Unknown name",
    idNumber: row.id_number ?? "Missing ID number",
    requestType: type,
    approvalStatus: row.approval_status,
    documentUrl: null,
    documentContentType: row.id_document_content_type,
    documentSizeBytes: row.id_document_size_bytes,
    documentUploadedAt: row.id_document_uploaded_at,
    rejectionReason: row.rejection_reason,
    rejectedAt: row.rejected_at,
    submittedAt: row.submitted_at,
    createdAt: row.profiles?.created_at ?? row.submitted_at ?? "",
  }));
}

export async function getAccountReviewMetrics(): Promise<AccountReviewMetrics> {
  await assertReviewer();

  const supabase = createAdminClient();
  const statuses = [
    APPROVAL_STATUS.PENDING,
    APPROVAL_STATUS.APPROVED,
    APPROVAL_STATUS.REJECTED,
  ] as const;

  const counts = await Promise.all(
    ACCOUNT_REQUEST_ROLES.flatMap((type) =>
      statuses.map(async (status) => {
        const { count, error } = await supabase
          .from("account_requests")
          .select("profile_id", { count: "exact", head: true })
          .eq("request_type", type)
          .eq("approval_status", status)
          .not("submitted_at", "is", null);

        if (error) {
          throw new Error(error.message);
        }

        return { type, status, count: count ?? 0 };
      }),
    ),
  );

  const emptyCounts = (): AccountReviewStatusCounts => ({
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const metrics: AccountReviewMetrics = {
    student: emptyCounts(),
    instructor: emptyCounts(),
  };

  for (const { type, status, count } of counts) {
    metrics[type][status] = count;
  }

  return metrics;
}

export async function getAccountDocumentSignedUrl(
  requestId: string,
): Promise<string | null> {
  try {
    await assertReviewer();
  } catch {
    return null;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("account_requests")
    .select("id_document_path")
    .eq("profile_id", requestId)
    .maybeSingle();

  if (error || !data?.id_document_path) {
    return null;
  }

  const { data: signedData } = await supabase.storage
    .from(ACCOUNT_DOCUMENT_BUCKET)
    .createSignedUrl(data.id_document_path, 60 * 10);

  return signedData?.signedUrl ?? null;
}
