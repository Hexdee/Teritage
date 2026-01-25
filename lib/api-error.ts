export function getApiErrorMessage(error: unknown, fallback: string): string {
  const responseMessage = (error as { response?: { data?: { message?: string; error?: { message?: string } } } })
    ?.response?.data;

  const message = responseMessage?.message || responseMessage?.error?.message;
  if (message && message.trim().length > 0) {
    return message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
