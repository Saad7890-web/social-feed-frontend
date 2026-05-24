import axios from "axios";

type ErrorResponseShape = {
  message?: unknown;
};

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const payload = error.response?.data as ErrorResponseShape | undefined;
    const rawMessage =
      typeof payload?.message === "string" ? payload.message : undefined;

    switch (status) {
      case 400:
      case 422:
        return rawMessage ?? "Please check your input and try again.";
      case 401:
        return "Invalid credentials";
      case 403:
        return "You are not allowed to do that.";
      case 404:
        return "The requested item could not be found.";
      case 429:
        return "Too many attempts. Please wait and try again.";
      default:
        return rawMessage ?? fallback;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
