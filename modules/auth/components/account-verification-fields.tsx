"use client";

import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

import { ImageUploadField } from "@/shared/components/image-upload-field";
import { RegisterTextField } from "@/modules/auth/components/register-form-parts";
import { ACCOUNT_REQUEST_COPY } from "@/modules/auth/utils/account-request-copy";
import {
  ID_DOCUMENT_MAX_BYTES,
  ID_DOCUMENT_TYPES,
} from "@/modules/auth/utils/account-document";
import type { AccountRequestRole } from "@/shared/lib/rbac/config";

export function AccountVerificationFields({
  currentImageUrl = null,
  disabled = false,
  idDocument,
  idDocumentError,
  idNumberError,
  idNumberRegistration,
  idPrefix,
  onIdDocumentChange,
  role,
}: {
  currentImageUrl?: string | null;
  disabled?: boolean;
  idDocument: File | null;
  idDocumentError?: string;
  idNumberError?: FieldError;
  idNumberRegistration: UseFormRegisterReturn;
  idPrefix: string;
  onIdDocumentChange: (file: File | null) => void;
  role: AccountRequestRole;
}) {
  const copy = ACCOUNT_REQUEST_COPY[role];
  const helperText = currentImageUrl
    ? `Your current ${copy.idImageLabel.toLowerCase()} stays unless you replace it with a new JPG, PNG, or WebP image. Max ${ID_DOCUMENT_MAX_BYTES / 1024 / 1024} MB.`
    : `Upload a JPG, PNG, or WebP image of your ${
        copy.idImageLabel.toLowerCase()
      }. Max ${ID_DOCUMENT_MAX_BYTES / 1024 / 1024} MB.`;

  return (
    <div className="grid gap-5 sm:grid-cols-2 sm:items-start sm:gap-3">
      <RegisterTextField
        error={idNumberError}
        id={`${idPrefix}-id-number`}
        label={copy.idNumberLabel}
        placeholder={copy.idNumberPlaceholder}
        registration={idNumberRegistration}
      />
      <ImageUploadField
        accept={ID_DOCUMENT_TYPES}
        currentImageUrl={currentImageUrl}
        disabled={disabled}
        errorText={idDocumentError}
        helperText={helperText}
        id={`${idPrefix}-id-document`}
        label={copy.idImageLabel}
        onChange={onIdDocumentChange}
        required={!currentImageUrl}
        theme="dark"
        value={idDocument}
        variant="compact"
      />
    </div>
  );
}
