import { AuthRolePicker } from "@/modules/auth/components/auth-role-picker";
import { AUTH_MODE } from "@/modules/auth/utils/auth-role-config";

export function RegisterPage() {
  return <AuthRolePicker mode={AUTH_MODE.REGISTER} />;
}
