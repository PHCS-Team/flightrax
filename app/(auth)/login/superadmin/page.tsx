import { ROLE } from "@/shared/lib/rbac/config";
import { RoleAuthPage } from "@/modules/auth/components/role-auth-page";
import { AUTH_MODE } from "@/modules/auth/utils/auth-role-config";

export default function Page() {
  return <RoleAuthPage mode={AUTH_MODE.LOGIN} role={ROLE.SUPERADMIN} />;
}
