"use client";

import { CheckIcon, TriangleAlertIcon } from "lucide-react";
import { useState } from "react";

import { useApproveFlightRequest } from "@/modules/flight-documents/hooks/use-approve-flight-request.action";
import { ConfirmationDialog } from "@/shared/components/layout/confirmation-dialog";
import { useVerifyPasscode } from "@/shared/hooks/use-verify-passcode.action";
import { PasscodeGatewayDialog } from "@/shared/components/layout/passcode-gateway-dialog";
import { Button } from "@/shared/components/ui/button";

export function SelfApproveAction({ flightPlanId }: { flightPlanId: string }) {
  const [passcodeOpen, setPasscodeOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [verifiedPasscode, setVerifiedPasscode] = useState("");
  const verifyPasscode = useVerifyPasscode();
  const approveRequest = useApproveFlightRequest({
    onApproved: () => setConfirmOpen(false),
  });

  return (
    <>
      <div className="flex flex-col gap-2 rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-primary-foreground/80">
          You are the pilot in command or the flight instructor on this flight
          plan, so you can approve your own request once you have
          double-checked every detail.
        </p>
        <Button
          className="shrink-0 disabled:cursor-default"
          disabled={approveRequest.isExecuting}
          onClick={() => {
            setVerifiedPasscode("");
            setPasscodeOpen(true);
          }}
          size="sm"
          type="button"
        >
          <CheckIcon className="size-4" />
          Approve my request
        </Button>
      </div>

      <PasscodeGatewayDialog
        description="Enter your 4-digit security passcode to approve your own flight request."
        isVerifying={verifyPasscode.status === "executing"}
        onOpenChange={setPasscodeOpen}
        onVerified={(passcode) => {
          setVerifiedPasscode(passcode);
          setPasscodeOpen(false);
          setConfirmOpen(true);
        }}
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
        description="You are about to approve your own flight plan request."
        icon={TriangleAlertIcon}
        warning="Double-check every field of the flight plan and its Weight & Balance before confirming. Once approved, the plan is locked from editing and the approval is permanently traced back to you as the approver."
        isConfirming={approveRequest.isExecuting}
        onConfirm={() =>
          approveRequest.execute({ flightPlanId, passcode: verifiedPasscode })
        }
        onOpenChange={setConfirmOpen}
        open={confirmOpen}
        title="Approve Your Own Request?"
      />
    </>
  );
}
