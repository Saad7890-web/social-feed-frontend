import type { AxiosError, AxiosRequestConfig, Method } from "axios";
import type { ApiEnvelope } from "../types/api";
import { clearCsrfToken, ensureCsrfToken } from "./csrf";
import { http } from "./http";

const SAFE_METHODS = new Set<Method>(["get", "head", "options"]);
const CSRF_ERROR_CODE = "CSRF_FAILED";

function isCsrfError(error: unknown) {
  const axiosError = error as AxiosError<{ error?: { code?: string } }>;

  return (
    Boolean(axiosError?.isAxiosError) &&
    axiosError.response?.status === 403 &&
    axiosError.response?.data?.error?.code === CSRF_ERROR_CODE
  );
}

export async function request<T>(
  config: AxiosRequestConfig,
): Promise<ApiEnvelope<T>> {
  const method = ((config.method ?? "get") as string).toLowerCase() as Method;

  const baseHeaders: Record<string, string> = {
    ...(config.headers as Record<string, string> | undefined),
  };

  const runRequest = async () => {
    const headers: Record<string, string> = { ...baseHeaders };

    if (!SAFE_METHODS.has(method)) {
      const token = await ensureCsrfToken();
      headers["X-CSRF-Token"] = token;
    }

    const response = await http.request<ApiEnvelope<T>>({
      ...config,
      method,
      headers,
    });

    return response.data;
  };

  try {
    return await runRequest();
  } catch (error) {
    if (!SAFE_METHODS.has(method) && isCsrfError(error)) {
      clearCsrfToken();

      const token = await ensureCsrfToken();
      const retryHeaders: Record<string, string> = {
        ...baseHeaders,
        "X-CSRF-Token": token,
      };

      const response = await http.request<ApiEnvelope<T>>({
        ...config,
        method,
        headers: retryHeaders,
      });

      return response.data;
    }

    throw error;
  }
}

export function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as ApiEnvelope<T>).data;
    if (data !== undefined) return data;
  }
  return payload as T;
}
