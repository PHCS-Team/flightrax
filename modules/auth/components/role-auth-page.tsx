import { ROLE } from "@/shared/lib/rbac/config";
import type { ProfileRole } from "@/shared/lib/rbac/types";
import { AuthShell } from "@/modules/auth/components/auth-shell";
import { LoginForm } from "@/modules/auth/components/login-form";
import { RegisterForm } from "@/modules/auth/components/register-form";
import { StudentRegisterForm } from "@/modules/auth/components/student-register-form";
import {
  AUTH_MODE,
  AUTH_MODE_CONFIG,
  AUTH_ROLE_CONFIG,
  type AuthMode,
} from "@/modules/auth/utils/auth-role-config";

export function RoleAuthPage({
  mode,
  role,
}: {
  mode: AuthMode;
  role: ProfileRole;
}) {
  const config = AUTH_ROLE_CONFIG[role];
  const modeConfig = AUTH_MODE_CONFIG[mode];

  return (
    <AuthShell
      contentClassName={
        mode === AUTH_MODE.REGISTER && role === ROLE.STUDENT
          ? "sm:max-w-2xl xl:max-w-3xl"
          : undefined
      }
      eyebrow={config.eyebrow}
      title={config.title[mode]}
      description={modeConfig.selectedDescription}
    >
      {mode === AUTH_MODE.LOGIN ? (
        <LoginForm role={role} />
      ) : role === ROLE.STUDENT ? (
        <StudentRegisterForm />
      ) : (
        <RegisterForm role={role} />
      )}
    </AuthShell>
  );
}
