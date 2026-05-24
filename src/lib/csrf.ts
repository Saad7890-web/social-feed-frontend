import type { ApiEnvelope } from "../types/api";
import { http } from "./http";

let csrfToken: string | null = null;
let pendingCsrfRequest: Promise<string | null> | null = null;

export function getCsrfToken() {
  return csrfToken;
}

export function setCsrfToken(token: string | null) {
  csrfToken = token;
}

export function clearCsrfToken() {
  csrfToken = null;
}

export async function ensureCsrfToken(): Promise<string | null> {
  if (csrfToken) return csrfToken;

  if (!pendingCsrfRequest) {
    pendingCsrfRequest = http
      .get<ApiEnvelope<{ csrfToken: string }>>("/security/csrf", {
        headers: {
          "Cache-Control": "no-store",
        },
      })
      .then((response) => {
        const token = response.data?.data?.csrfToken ?? null;

        csrfToken = token;
        return token;
      })
      .catch(() => null)
      .finally(() => {
        pendingCsrfRequest = null;
      });
  }

  return pendingCsrfRequest;
}
