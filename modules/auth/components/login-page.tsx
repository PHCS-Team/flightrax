import Link from "next/link";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { AuthShell } from "@/modules/auth/components/auth-shell";

export function LoginPage() {
  return (
    <AuthShell eyebrow="Crew access" title="Sign in to the operations desk.">
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Static form shell ready for Supabase Auth.
          </p>
        </div>
        <Input placeholder="ops@flightrax.test" type="email" />
        <Input placeholder="Password" type="password" />
        <Button className="w-full">Continue</Button>
        <p className="text-center text-sm text-muted-foreground">
          Need an account? <Link className="font-medium text-foreground" href="/register">Register</Link>
        </p>
      </div>
    </AuthShell>
  );
}
