type ApiErrorResponse = {
  message?: unknown;
};

export async function getApiErrorMessage(
  response: Response,
  fallback: string,
) {
  try {
    const payload = (await response.json()) as ApiErrorResponse;

    if (typeof payload.message === "string" && payload.message.trim()) {
      return payload.message;
    }
  } catch {
    return fallback;
  }

  return fallback;
}
