import { ROLE } from "@/shared/lib/rbac/config";
import type { ProfileRole } from "@/shared/lib/rbac/types";
import { AdminRegisterForm } from "@/modules/auth/components/admin-register-form";
import { AuthShell } from "@/modules/auth/components/auth-shell";
import { InstructorRegisterForm } from "@/modules/auth/components/instructor-register-form";
import { LoginForm } from "@/modules/auth/components/login-form";
import { StudentRegisterForm } from "@/modules/auth/components/student-register-form";
import { SuperadminRegisterForm } from "@/modules/auth/components/superadmin-register-form";
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
      contentClassName={"sm:max-w-lg xl:max-w-xl"}
      eyebrow={config.eyebrow}
      title={config.title[mode]}
      description={modeConfig.selectedDescription}
    >
      {mode === AUTH_MODE.LOGIN && <LoginForm role={role} />}
      {mode === AUTH_MODE.REGISTER && role === ROLE.STUDENT && (
        <StudentRegisterForm />
      )}
      {mode === AUTH_MODE.REGISTER && role === ROLE.INSTRUCTOR && (
        <InstructorRegisterForm />
      )}
      {mode === AUTH_MODE.REGISTER && role === ROLE.ADMIN && (
        <AdminRegisterForm />
      )}
      {mode === AUTH_MODE.REGISTER && role === ROLE.SUPERADMIN && (
        <SuperadminRegisterForm />
      )}
    </AuthShell>
  );
}
