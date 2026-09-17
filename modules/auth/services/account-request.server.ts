import "server-only";

import { APPROVAL_STATUS, ROLE_LABELS } from "@/shared/lib/rbac/config";
import type { AccountRequestRole } from "@/shared/lib/rbac/config";
import { describeActionError } from "@/shared/lib/action-error";
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

const UNIQUE_VIOLATION = "23505";

export function idNumberTakenMessage(role: AccountRequestRole): string {
  return `This ${ROLE_LABELS[role].toLowerCase()} ID number is already registered. If you have already signed up, sign in instead.`;
}

// Checked before the auth account is created. A second registration with
// the same ID number — most often the same person tapping Register again on
// a slow connection — would otherwise create a second auth user and then
// fail on account_requests_id_number_key, stranding that user with no
// verification details.
export async function isIdNumberRegistered(
  role: AccountRequestRole,
  idNumber: string,
  exceptProfileId?: string,
): Promise<boolean> {
  const adminSupabase = createAdminClient();
  let query = adminSupabase
    .from("account_requests")
    .select("profile_id")
    .eq("request_type", role)
    .eq("id_number", idNumber)
    .limit(1);

  if (exceptProfileId) {
    query = query.neq("profile_id", exceptProfileId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(describeActionError(error));
  }

  return Boolean(data);
}

function describeRequestError(
  error: { code?: string; message: string },
  role: AccountRequestRole,
): string {
  if (error.code === UNIQUE_VIOLATION) {
    return idNumberTakenMessage(role);
  }

  return describeActionError(error);
}

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

    return requestError ? describeRequestError(requestError, role) : null;
  }

  const documentPath = getAccountIdDocumentPath(userId, idDocument.type);
  const { error: uploadError } = await adminSupabase.storage
    .from(ACCOUNT_DOCUMENT_BUCKET)
    .upload(documentPath, idDocument, {
      contentType: idDocument.type,
      upsert: false,
    });

  if (uploadError) {
    return describeActionError(uploadError);
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

    return describeRequestError(requestError, role);
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
