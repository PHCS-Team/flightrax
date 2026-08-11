"use client";

import Image from "next/image";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  Clock3Icon,
  FileImageIcon,
  SearchXIcon,
  UserRoundCheckIcon,
} from "lucide-react";

import { AccountReviewActions } from "@/modules/account-review/components/account-review-actions";
import { accountDocumentQueryOptions } from "@/modules/account-review/queries/account-review";
import type { AccountReviewItem } from "@/modules/account-review/types/account-review";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { APPROVAL_STATUS, ROLE_LABELS } from "@/shared/lib/rbac/config";
import type { ApprovalStatus } from "@/shared/lib/rbac/types";
import { cn } from "@/shared/lib/utils";

function formatBytes(bytes: number | null) {
  if (!bytes) {
    return "Unknown size";
  }

  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatRelativeDate(value: string | null) {
  if (!value) {
    return "Not submitted";
  }

  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

function getStatusDetails(status: ApprovalStatus) {
  if (status === APPROVAL_STATUS.REJECTED) {
    return {
      icon: AlertTriangleIcon,
      label: "Rejected",
      className:
        "border-destructive/35 bg-destructive/15 text-primary-foreground shadow-sm",
    };
  }

  if (status === APPROVAL_STATUS.APPROVED) {
    return {
      icon: CheckCircle2Icon,
      label: "Approved",
      className:
        "border-success/40 bg-success/20 text-primary-foreground shadow-sm",
    };
  }

  return {
    icon: Clock3Icon,
    label: "Pending",
    className:
      "border-warning/45 bg-warning/20 text-primary-foreground shadow-sm",
  };
}

function ReviewMetadata({ request }: { request: AccountReviewItem }) {
  const details = [
    {
      label: `${ROLE_LABELS[request.requestType]} ID`,
      value: request.idNumber,
    },
    { label: "Submitted", value: formatRelativeDate(request.submittedAt) },
    {
      label: "File type",
      value: request.documentContentType ?? "Unknown type",
    },
    { label: "File size", value: formatBytes(request.documentSizeBytes) },
  ];

  return (
    <section aria-label="Account review metadata">
      <div className="flex items-center gap-3">
        <p className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-primary-foreground/55">
          Request Details
        </p>
        <span className="h-px flex-1 bg-primary-foreground/10" />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-4 text-sm sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
        {details.map((detail) => (
          <div className="min-w-0" key={detail.label}>
            <dt className="text-[0.64rem] font-medium uppercase tracking-[0.16em] text-primary-foreground/50">
              {detail.label}
            </dt>
            <dd className="mt-1 truncate text-sm font-semibold leading-5 text-primary-foreground">
              {detail.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function AccountIdPreview({
  request,
  variant,
}: {
  request: AccountReviewItem;
  variant: "mobile" | "desktop";
}) {
  const [open, setOpen] = useState(false);
  const roleLabel = ROLE_LABELS[request.requestType];

  const uploadedAt = formatRelativeDate(request.documentUploadedAt);

  const {
    data: documentUrl,
    isPending: isLoading,
    error,
  } = useQuery(accountDocumentQueryOptions(request.id, open));

  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "Could not load document preview."
        : null;

  if (!request.documentUploadedAt) {
    return (
      <section
        aria-label={`${roleLabel} ID preview`}
        className={cn(
          "flex items-center justify-center rounded-2xl bg-primary-foreground/10 text-center text-sm text-primary-foreground/65 ring-1 ring-primary-foreground/10",
          variant === "mobile"
            ? "min-h-20 px-4 py-4"
            : "min-h-[17.2rem] w-44 px-4",
        )}
      >
        No ID preview available
      </section>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className={cn(
            "group relative w-full cursor-pointer overflow-hidden rounded-2xl bg-primary-foreground/10 text-left ring-1 ring-primary-foreground/15 transition hover:bg-primary-foreground/15 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            variant === "desktop"
              ? "block w-44 p-2"
              : "flex items-center gap-3 p-2.5",
          )}
          type="button"
        >
          {variant === "desktop" ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary-foreground/20">
                <FileImageIcon className="size-6 text-primary-foreground/60" />
              </span>
              <div className="text-center">
                <p className="text-sm font-semibold text-primary-foreground">
                  {roleLabel} ID Preview
                </p>
                <p className="mt-0.5 text-xs text-primary-foreground/65">
                  Uploaded {uploadedAt}
                </p>
              </div>
              <span className="rounded-full bg-primary-foreground/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-primary-foreground/70">
                View
              </span>
            </div>
          ) : (
            <>
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary-foreground/20">
                <FileImageIcon className="size-6 text-primary-foreground/60" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-sm font-semibold text-primary-foreground">
                  <span className="truncate">{roleLabel} ID preview</span>
                </span>
                <span className="mt-0.5 block truncate text-xs text-primary-foreground/65">
                  Uploaded {uploadedAt}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-primary-foreground/10 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-primary-foreground/70">
                Open
              </span>
            </>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-4 overflow-y-auto bg-background p-4 text-foreground sm:max-w-sm sm:gap-5 sm:p-5">
        <DialogSectionHeader
          className="**:data-[slot=dialog-description]:text-muted-foreground **:data-[slot=dialog-title]:text-foreground [&_span]:bg-muted [&_span]:text-foreground [&_span]:ring-border"
          description={`Uploaded ${uploadedAt} for review.`}
          icon={FileImageIcon}
          title={`${roleLabel} ID Preview`}
        />
        <div className="border-t border-border pt-3 sm:pt-4">
          <div className="relative mx-auto aspect-3/4 w-full max-w-[42dvh] overflow-hidden rounded-2xl bg-muted shadow-inner ring-1 ring-border sm:max-w-[49.5vh]">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <p className="animate-pulse text-sm text-muted-foreground">
                  Loading document preview...
                </p>
              </div>
            ) : errorMessage ? (
              <div className="flex h-full items-center justify-center px-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-destructive">
                    Could not load document preview.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {errorMessage}
                  </p>
                </div>
              </div>
            ) : documentUrl ? (
              <Image
                alt={`${request.fullName} ${roleLabel.toLowerCase()} ID`}
                className="object-cover"
                fill
                sizes="60vh"
                src={documentUrl}
                unoptimized
              />
            ) : null}
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div className="min-w-0">
              <dt className="text-[0.64rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {roleLabel}
              </dt>
              <dd className="mt-1 truncate font-semibold text-foreground">
                {request.fullName}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[0.64rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {roleLabel} ID
              </dt>
              <dd className="mt-1 truncate font-semibold text-foreground">
                {request.idNumber}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[0.64rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                File size
              </dt>
              <dd className="mt-1 truncate font-semibold text-foreground">
                {formatBytes(request.documentSizeBytes)}
              </dd>
            </div>
          </dl>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AccountReviewRequest({ request }: { request: AccountReviewItem }) {
  const status = getStatusDetails(request.approvalStatus);
  const StatusIcon = status.icon;
  const roleLabel = ROLE_LABELS[request.requestType];

  return (
    <GlassSurface className="overflow-hidden p-0">
      <article className="divide-y divide-primary-foreground/10">
        <div className="p-4 sm:p-5">
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_10rem] md:items-start lg:grid-cols-[minmax(0,1fr)_11rem]">
            <div className="grid gap-5">
              <header className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary-foreground/65">
                    <UserRoundCheckIcon className="size-3.5" />
                    {roleLabel} Verification
                  </div>
                  <div className="min-w-0 mt-1">
                    <h2 className="truncate text-xl font-semibold tracking-tight text-primary-foreground sm:text-2xl">
                      {request.fullName}
                    </h2>
                    <p className="mt-1 truncate text-sm text-primary-foreground/70">
                      {request.email}
                    </p>
                  </div>
                </div>
                <Badge
                  className={cn(
                    "h-7 shrink-0 gap-1.5 px-2.5 capitalize",
                    status.className,
                  )}
                  variant="outline"
                >
                  <StatusIcon className="size-3.5" />
                  {status.label}
                </Badge>
              </header>

              <div className="md:hidden">
                <AccountIdPreview request={request} variant="mobile" />
              </div>

              <ReviewMetadata request={request} />

              {request.rejectionReason && (
                <section className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-primary-foreground ring-1 ring-destructive/20">
                  <p className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-red-200">
                    Rejection Reason
                  </p>
                  <p className="mt-2 leading-6 text-primary-foreground/75">
                    {request.rejectionReason}
                  </p>
                </section>
              )}
            </div>

            <div className="hidden min-w-0 md:flex md:justify-end">
              <AccountIdPreview request={request} variant="desktop" />
            </div>
          </div>
        </div>

        <footer className="g-primary-foreground/4 px-4 py-4 sm:px-5">
          <div className="grid gap-3 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] md:items-start lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary-foreground">
                Review Decision
              </p>
              <p className="mt-0.5 text-xs leading-5 text-primary-foreground/65">
                Approve verified {roleLabel.toLowerCase()}s, or reject pending
                submissions with a clear correction note.
              </p>
            </div>
            <div className="min-w-0 [&_button]:cursor-pointer">
              <AccountReviewActions
                approvalStatus={request.approvalStatus}
                requestId={request.id}
                requestType={request.requestType}
              />
            </div>
          </div>
        </footer>
      </article>
    </GlassSurface>
  );
}

export function AccountReviewList({
  hasActiveSearch,
  onClearSearch,
  requests,
}: {
  hasActiveSearch: boolean;
  onClearSearch: () => void;
  requests: AccountReviewItem[];
}) {
  if (requests.length === 0) {
    return (
      <EmptyState
        action={
          hasActiveSearch ? (
            <Button
              className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
              onClick={onClearSearch}
              type="button"
              variant="outline"
            >
              Clear search
            </Button>
          ) : undefined
        }
        description={
          hasActiveSearch
            ? "Try another name, email, ID number, status, or rejection phrase."
            : "New submissions will appear here once applicants register."
        }
        icon={<SearchXIcon className="size-7" />}
        title={
          hasActiveSearch
            ? "No matching review requests"
            : "No requests to review"
        }
      />
    );
  }

  return (
    <div className="grid gap-3">
      {requests.map((request) => (
        <AccountReviewRequest key={request.id} request={request} />
      ))}
    </div>
  );
}
