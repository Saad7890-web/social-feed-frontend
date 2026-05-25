import type { ApiEnvelope } from "../types/api";
import { http } from "./http";

let csrfToken: string | null = null;
let pendingCsrfRequest: Promise<string> | null = null;

export function getCsrfToken() {
  return csrfToken;
}

export function setCsrfToken(token: string | null) {
  csrfToken = token;
}

export function clearCsrfToken() {
  csrfToken = null;
}

export async function ensureCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;

  if (!pendingCsrfRequest) {
    pendingCsrfRequest = http
      .get<ApiEnvelope<{ csrfToken: string }>>("/security/csrf")
      .then((response) => {
        const token = response.data?.data?.csrfToken;

        if (typeof token !== "string" || !token.trim()) {
          throw new Error("CSRF token is missing.");
        }

        csrfToken = token;
        return token;
      })
      .finally(() => {
        pendingCsrfRequest = null;
      });
  }

  return pendingCsrfRequest;
}
