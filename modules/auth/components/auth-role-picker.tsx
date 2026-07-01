import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { PUBLIC_AUTH_ROLES } from "@/shared/lib/rbac/config";
import { AuthShell } from "@/modules/auth/components/auth-shell";
import { AUTH_ROLE_CONFIG } from "@/modules/auth/utils/auth-role-config";


export function AuthRolePicker({ mode }: { mode: "login" | "register" }) {
  return (
    <AuthShell
      eyebrow={mode === "login" ? "Choose access" : "Choose registration"}
      title={mode === "login" ? "Sign in through your FlightRax role." : "Start with the right registration lane."}
      description="Each role has its own auth path so approvals, departments, and permissions stay explicit."
    >
      <div className="space-y-4">
        {PUBLIC_AUTH_ROLES.map((role) => {
          const config = AUTH_ROLE_CONFIG[role];

          return (
            <Card key={role} className="shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base">{config.label}</CardTitle>
                  <Badge variant="secondary">{role}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">{config.helper}</p>
                <Button asChild className="w-full" variant="outline">
                  <Link href={`/${mode}/${role}`}>
                    Continue
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AuthShell>
  );
}
