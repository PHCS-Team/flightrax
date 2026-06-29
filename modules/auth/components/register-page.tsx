import Link from "next/link";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { AuthShell } from "@/modules/auth/components/auth-shell";

export function RegisterPage() {
  return (
    <AuthShell eyebrow="Station setup" title="Create an operations workspace.">
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Start access</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Static registration shell ready for validation and safe actions.
          </p>
        </div>
        <Input placeholder="Workspace name" />
        <Input placeholder="ops@flightrax.test" type="email" />
        <Input placeholder="Password" type="password" />
        <Button className="w-full">Create workspace</Button>
        <p className="text-center text-sm text-muted-foreground">
          Already registered? <Link className="font-medium text-foreground" href="/login">Sign in</Link>
        </p>
      </div>
    </AuthShell>
  );
}
