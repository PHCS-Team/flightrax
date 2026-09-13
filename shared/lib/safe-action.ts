import { createSafeActionClient } from "next-safe-action";

// An exception inside an action reaches the client as `serverError`. The raw
// message can name tables or keys, so the user gets a plain sentence and the
// detail goes to the server log.
export const actionClient = createSafeActionClient({
  handleServerError(error) {
    console.error("[action]", error);

    return "Something went wrong. Please try again.";
  },
});
