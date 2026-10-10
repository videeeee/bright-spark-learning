/**
 * LearnQuest Centralized API Client
 * - Base URL configuration from VITE_API_URL
 * - Automatic Authorization: Bearer <token>
 * - Request timeouts with AbortController
 * - Unified typed error handling & 401 token expiration handling
 */

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  msg?: string;
  [key: string]: any;
}

export class ApiError extends Error {
  status: number;
  data: any;
  isColdStart?: boolean;

  constructor(message: string, status: number, data?: any, isColdStart = false) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.isColdStart = isColdStart;
  }
}

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const DEFAULT_TIMEOUT_MS = 15000;

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  skipAuth?: boolean;
}

async function request<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, skipAuth = false, headers = {}, ...rest } = options;

  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = localStorage.getItem("token");
    if (token) {
      requestHeaders["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...rest,
      headers: requestHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 401 Unauthorized handling
    if (response.status === 401) {
      localStorage.removeItem("token");
      // Dispatch an event so contexts/listeners can react without hard window reloads
      window.dispatchEvent(new Event("learnquest:unauthorized"));
    }

    let responseData: any;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      const errorMsg =
        (typeof responseData === "object" && (responseData?.msg || responseData?.message || responseData?.error)) ||
        `Request failed with status ${response.status}`;

      throw new ApiError(errorMsg, response.status, responseData);
    }

    return responseData as T;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new ApiError(
        "Request timed out. The server may be waking up (Render cold-start), please retry.",
        408,
        null,
        true
      );
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      error.message || "Network error. Please check your connection.",
      0,
      error
    );
  }
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),

  // Base URL helper
  getBaseUrl: () => BASE_URL,
};
