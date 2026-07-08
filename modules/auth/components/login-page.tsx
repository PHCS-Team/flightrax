import { AuthRolePicker } from "@/modules/auth/components/auth-role-picker";
import { LogoutSuccessToast } from "@/modules/auth/components/logout-success-toast";
import { AUTH_MODE } from "@/modules/auth/utils/auth-role-config";

export function LoginPage() {
  return (
    <>
      <LogoutSuccessToast />
      <AuthRolePicker mode={AUTH_MODE.LOGIN} />
    </>
  );
}
