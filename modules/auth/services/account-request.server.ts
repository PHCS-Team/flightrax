import "server-only";

import { APPROVAL_STATUS } from "@/shared/lib/rbac/config";
import type { AccountRequestRole } from "@/shared/lib/rbac/config";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { createClient } from "@/shared/lib/supabase/server";
import { ACCOUNT_DOCUMENT_BUCKET } from "@/shared/lib/storage/buckets";
import { getAccountIdDocumentPath } from "@/modules/auth/utils/account-document";

type SubmitAccountRequestInput = {
  userId: string;
  role: AccountRequestRole;
  idNumber: string;
  idDocument: File | null;
};

// Resets the user's account request to a fresh pending submission, uploading
// the verification document when one is provided (resubmissions may keep the
// already-uploaded document). Returns an error message or null on success.
export async function submitAccountRequest({
  userId,
  role,
  idNumber,
  idDocument,
}: SubmitAccountRequestInput): Promise<string | null> {
  const adminSupabase = createAdminClient();
  const now = new Date().toISOString();

  if (!idDocument) {
    const { error: requestError } = await adminSupabase
      .from("account_requests")
      .update({
        id_number: idNumber,
        submitted_at: now,
        approval_status: APPROVAL_STATUS.PENDING,
        approved_at: null,
        approved_by: null,
        rejected_at: null,
        rejected_by: null,
        rejection_reason: null,
      })
      .eq("profile_id", userId);

    return requestError?.message ?? null;
  }

  const documentPath = getAccountIdDocumentPath(userId, idDocument.type);
  const { error: uploadError } = await adminSupabase.storage
    .from(ACCOUNT_DOCUMENT_BUCKET)
    .upload(documentPath, idDocument, {
      contentType: idDocument.type,
      upsert: false,
    });

  if (uploadError) {
    return uploadError.message;
  }

  const { error: requestError } = await adminSupabase
    .from("account_requests")
    .upsert(
      {
        profile_id: userId,
        request_type: role,
        id_number: idNumber,
        id_document_path: documentPath,
        id_document_content_type: idDocument.type,
        id_document_size_bytes: idDocument.size,
        id_document_uploaded_at: now,
        submitted_at: now,
        approval_status: APPROVAL_STATUS.PENDING,
        approved_at: null,
        approved_by: null,
        rejected_at: null,
        rejected_by: null,
        rejection_reason: null,
      },
      { onConflict: "profile_id" },
    );

  if (requestError) {
    await adminSupabase.storage
      .from(ACCOUNT_DOCUMENT_BUCKET)
      .remove([documentPath]);

    return requestError.message;
  }

  return null;
}

// Signs the current user's own verification document; storage RLS limits the
// user client to files inside their own folder.
export async function getOwnAccountDocumentUrl(
  documentPath: string | null | undefined,
): Promise<string | null> {
  if (!documentPath) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase.storage
    .from(ACCOUNT_DOCUMENT_BUCKET)
    .createSignedUrl(documentPath, 60 * 10);

  return data?.signedUrl ?? null;
}
