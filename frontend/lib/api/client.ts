import { readStoredToken } from "@/lib/auth/token-storage";
import { ApiClientError } from "@/lib/api/errors";
import type { ApiError } from "@/types/api";

type RequestOptions = RequestInit & {
  authenticated?: boolean;
};

export function getApiOrigin() {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
  return configured.replace(/\/$/, "");
}

function buildUrl(path: string) {
  const baseUrl = getApiOrigin();
  const apiBaseUrl = baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
  return `${apiBaseUrl}${path}`;
}

function emitUnauthorized() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("workmeter:unauthorized"));
  }
}

async function parseError(response: Response): Promise<ApiError> {
  try {
    const payload = (await response.json()) as Partial<ApiError>;
    return {
      statusCode: payload.statusCode ?? response.status,
      message: payload.message ?? response.statusText,
      error: payload.error ?? response.statusText
    };
  } catch {
    return {
      statusCode: response.status,
      message: response.statusText,
      error: response.statusText
    };
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const hasBody = options.body !== undefined;

  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.authenticated !== false) {
    const token = readStoredToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers
  });

  if (!response.ok) {
    const apiError = await parseError(response);
    if (apiError.statusCode === 401) {
      emitUnauthorized();
    }
    throw new ApiClientError(apiError);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function apiBlobRequest(path: string): Promise<Blob> {
  const token = readStoredToken();
  const response = await fetch(buildUrl(path), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  if (!response.ok) {
    const apiError = await parseError(response);
    if (apiError.statusCode === 401) emitUnauthorized();
    throw new ApiClientError(apiError);
  }
  return response.blob();
}
