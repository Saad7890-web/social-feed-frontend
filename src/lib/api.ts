import type { AxiosRequestConfig, Method } from "axios";
import type { ApiEnvelope } from "../types/api";
import { ensureCsrfToken } from "./csrf";
import { http } from "./http";

const SAFE_METHODS = new Set<Method>(["get", "head", "options"]);

export async function request<T>(
  config: AxiosRequestConfig,
): Promise<ApiEnvelope<T>> {
  const method = ((config.method ?? "get") as string).toLowerCase() as Method;
  const headers: Record<string, string> = {
    ...(config.headers as Record<string, string> | undefined),
  };

  if (!SAFE_METHODS.has(method)) {
    const token = await ensureCsrfToken();
    if (token) {
      headers["X-CSRF-Token"] = token;
    }
  }

  const response = await http.request<ApiEnvelope<T>>({
    ...config,
    method,
    headers,
  });

  return response.data;
}

export function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as ApiEnvelope<T>).data;
    if (data !== undefined) return data;
  }
  return payload as T;
}
