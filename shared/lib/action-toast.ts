import { toast } from "sonner";

type ActionToastResult =
  | {
      message?: string;
      ok: boolean;
    }
  | null
  | undefined;

type ActionErrorShape = {
  serverError?: unknown;
  validationErrors?: unknown;
  thrownError?: Error;
};

// Every useAction site passes this as onError. Without it a rejected request
// (thrown action, server-side validation, or the request never reaching the
// server — Vercel's 4.5 MB body cap, a dropped connection) ended with the
// spinner stopping and nothing else.
export function toastActionError(error: ActionErrorShape) {
  if (typeof error.serverError === "string" && error.serverError.trim()) {
    toast.error(error.serverError);
    return;
  }

  if (error.validationErrors) {
    toast.error("Some fields need attention. Check the form and try again.");
    return;
  }

  if (error.thrownError) {
    toast.error(
      "The request could not be completed. Check your connection and try again.",
    );
    return;
  }

  toast.error("Something went wrong. Please try again.");
}

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
