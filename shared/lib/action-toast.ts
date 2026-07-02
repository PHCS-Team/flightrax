import { toast } from "sonner";

type ActionToastResult = {
  message?: string;
  ok: boolean;
} | null | undefined;

export function toastActionResult(result: ActionToastResult) {
  if (!result?.message) {
    return;
  }

  if (result.ok) {
    toast.success(result.message);
    return;
  }

  toast.error(result.message);
}
