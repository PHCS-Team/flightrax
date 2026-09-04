"use client";

import { ArrowLeftIcon, CheckIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { RejectRequestDialog } from "@/modules/flight-documents/components/reject-request-dialog";
import { useApproveFlightRequest } from "@/modules/flight-documents/hooks/use-approve-flight-request.action";
import { useRejectFlightRequest } from "@/modules/flight-documents/hooks/use-reject-flight-request.action";
import type { FlightRequestStatus } from "@/modules/flight-documents/types/flight-request";
import { ConfirmationDialog } from "@/shared/components/layout/confirmation-dialog";
import { useVerifyPasscode } from "@/shared/hooks/use-verify-passcode.action";
import { PasscodeGatewayDialog } from "@/shared/components/layout/passcode-gateway-dialog";
import { Button } from "@/shared/components/ui/button";

export function FlightRequestReviewActions({
  flightPlanId,
  isPic,
  requestStatus,
}: {
  flightPlanId: string;
  isPic: boolean;
  requestStatus: FlightRequestStatus;
}) {
  const router = useRouter();
  const [flow, setFlow] = useState<"approve" | "reject" | null>(null);
  const [passcodeOpen, setPasscodeOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [verifiedPasscode, setVerifiedPasscode] = useState("");
  const verifyPasscode = useVerifyPasscode();
  const approveRequest = useApproveFlightRequest({
    onApproved: () => router.replace("/flight-requests"),
  });
  const rejectRequest = useRejectFlightRequest({
    onRejected: () => router.replace("/flight-requests"),
  });

  if (requestStatus !== "pending_approval") {
    return (
      <div className="flex flex-col-reverse gap-2 p-4 sm:flex-row sm:justify-end sm:p-0">
        <Button
          className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
          onClick={() => router.push("/flight-requests")}
          type="button"
          variant="outline"
        >
          <ArrowLeftIcon className="size-4" />
          Back to flight requests
        </Button>
      </div>
    );
  }

  function startFlow(nextFlow: "approve" | "reject") {
    setFlow(nextFlow);
    setVerifiedPasscode("");
    setPasscodeOpen(true);
  }

  function handleVerified(passcode: string) {
    setVerifiedPasscode(passcode);
    setPasscodeOpen(false);

    if (flow === "approve") {
      setConfirmOpen(true);
    } else {
      setRejectOpen(true);
    }
  }

  return (
    <>
      <div className="grid gap-2 p-4 sm:p-0">
        {!isPic && (
          <p className="text-xs text-primary-foreground/60 sm:text-right">
            Only the assigned pilot in command can approve or reject this
            request.
          </p>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            className="border-red-200/25 bg-red-200/10 text-red-100 hover:bg-red-200/15 hover:text-red-50 disabled:cursor-default"
            disabled={!isPic || rejectRequest.isExecuting}
            onClick={() => startFlow("reject")}
            type="button"
            variant="outline"
          >
            <XIcon className="size-4" />
            Reject request
          </Button>
          <Button
            className="disabled:cursor-default"
            disabled={!isPic || approveRequest.isExecuting}
            onClick={() => startFlow("approve")}
            type="button"
          >
            <CheckIcon className="size-4" />
            Approve request
          </Button>
        </div>
      </div>

      <PasscodeGatewayDialog
        description={
          flow === "approve"
            ? "Enter your 4-digit security passcode to approve this flight request."
            : "Enter your 4-digit security passcode to reject this flight request."
        }
        isVerifying={verifyPasscode.status === "executing"}
        onOpenChange={setPasscodeOpen}
        onVerified={handleVerified}
        open={passcodeOpen}
        verify={async (passcode) => {
          const result = await verifyPasscode.executeAsync({ passcode });

          return result?.data;
        }}
      />

      <ConfirmationDialog
        confirmLabel="Approve request"
        confirmVariant="default"
        confirmingLabel="Approving..."
        description="Approving confirms this flight plan and its Weight & Balance are correct. The approval is recorded under your name as the pilot in command."
        icon={CheckIcon}
        isConfirming={approveRequest.isExecuting}
        onConfirm={() =>
          approveRequest.execute({ flightPlanId, passcode: verifiedPasscode })
        }
        onOpenChange={setConfirmOpen}
        open={confirmOpen}
        title="Approve Flight Request?"
      />

      <RejectRequestDialog
        isSubmitting={rejectRequest.isExecuting}
        onOpenChange={setRejectOpen}
        onSubmit={(reason) =>
          rejectRequest.execute({
            flightPlanId,
            passcode: verifiedPasscode,
            reason,
          })
        }
        open={rejectOpen}
      />
    </>
  );
}
