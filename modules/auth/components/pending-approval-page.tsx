import Link from "next/link";

import { AuthShell } from "@/modules/auth/components/auth-shell";
import { Button } from "@/shared/components/ui/button";

export function PendingApprovalPage() {
  return (
    <AuthShell
      eyebrow="Approval pending"
      title="Your student account is waiting for campus approval."
    >
      <div className="space-y-5">
        <h2 className="text-2xl font-semibold tracking-tight">
          Request received
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          An instructor must approve your student profile before you can access
          FlightraX. Please check back after your campus verifies your account.
        </p>
        <Button
          asChild
          className="h-12 w-full rounded-lg px-7 font-bold uppercase sm:rounded-2xl"
        >
          <Link href="/login">Back to login options</Link>
        </Button>
      </div>
    </AuthShell>
  );
}
