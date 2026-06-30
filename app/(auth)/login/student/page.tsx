import { ROLE } from "@/shared/lib/rbac/config";
import { RoleAuthPage } from "@/modules/auth/components/role-auth-page";

export default function Page() {
  return <RoleAuthPage mode="login" role={ROLE.STUDENT} />;
}
