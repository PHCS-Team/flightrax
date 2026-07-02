"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";

import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { toastActionResult } from "@/shared/lib/action-toast";
import { APPROVAL_STATUS } from "@/shared/lib/rbac/config";
import type { ApprovalStatus } from "@/shared/lib/rbac/types";
import {
  approveStudentForReviewAction,
  rejectStudentForReviewAction,
} from "@/modules/auth/actions/review-student";

export function StudentReviewActions({
  approvalStatus,
  studentId,
}: {
  approvalStatus: ApprovalStatus;
  studentId: string;
}) {
  const router = useRouter();
  const [localStatus, setLocalStatus] = useState<ApprovalStatus | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const approve = useAction(approveStudentForReviewAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        setLocalStatus(APPROVAL_STATUS.APPROVED);
        setRejecting(false);
        router.refresh();
      }
    },
  });
  const reject = useAction(rejectStudentForReviewAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        setLocalStatus(APPROVAL_STATUS.REJECTED);
        setRejecting(false);
        setRejectionReason("");
        router.refresh();
      }
    },
  });
  const isExecuting = approve.isExecuting || reject.isExecuting;
  const currentStatus = localStatus ?? approvalStatus;
  const canReject = currentStatus === APPROVAL_STATUS.PENDING;
  const canApprove =
    currentStatus === APPROVAL_STATUS.PENDING ||
    currentStatus === APPROVAL_STATUS.REJECTED;

  if (!canApprove) {
    return null;
  }

  return (
    <div className="w-full space-y-3">
      {rejecting ? (
        <div className="grid gap-3">
          <Textarea
            className="min-h-24 w-full border-primary-foreground/20 bg-primary-foreground/95 text-primary placeholder:text-muted-foreground focus-visible:border-red-200/60 focus-visible:ring-red-200/25"
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder="Add the reason the student should fix before resubmitting"
            value={rejectionReason}
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground sm:w-auto"
              disabled={isExecuting}
              onClick={() => {
                setRejecting(false);
                setRejectionReason("");
              }}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="sm:w-auto"
              disabled={isExecuting || rejectionReason.trim().length < 3}
              onClick={() =>
                reject.execute({
                  studentId,
                  rejectionReason: rejectionReason.trim(),
                })
              }
              type="button"
              variant="destructive"
            >
              Submit rejection
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          {canReject && (
            <Button
              className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground sm:w-auto"
              disabled={isExecuting}
              onClick={() => setRejecting(true)}
              type="button"
              variant="outline"
            >
              Reject
            </Button>
          )}
          <Button
            className="sm:w-auto"
            disabled={isExecuting}
            onClick={() => approve.execute({ studentId })}
            type="button"
          >
            Approve
          </Button>
        </div>
      )}
    </div>
  );
}
