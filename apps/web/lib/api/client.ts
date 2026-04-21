import { clearSessionCookies, getClientSession, persistSession } from "@/lib/auth/session";
import type { AuthSession, CurrentUser } from "@/lib/types";
import { DEFAULT_API_BASE_URL, getClientApiBaseUrl } from "./endpoint";

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

async function refreshSession(refreshToken: string) {
  const response = await fetch(`${getClientApiBaseUrl()}/auth/refresh`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${refreshToken}`
    }
  });

  if (!response.ok) {
    clearSessionCookies();
    return null;
  }

  const data = (await response.json()) as AuthSession;
  persistSession(data);
  return data;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const session = getClientSession();
  const headers = new Headers(options.headers);
  const apiBaseUrl = getClientApiBaseUrl();

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false && session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers
  });

  if (response.status === 401 && session?.refreshToken && options.auth !== false) {
    const refreshed = await refreshSession(session.refreshToken);

    if (refreshed) {
      return apiRequest<T>(path, options);
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Permintaan ke server gagal.");
  }

  return response.json() as Promise<T>;
}

export async function loginRequest(username: string, password: string) {
  return apiRequest<AuthSession>("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ username, password })
  });
}

export async function logoutRequest() {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } finally {
    clearSessionCookies();
  }
}

export async function getCurrentUser() {
  return apiRequest<CurrentUser>("/auth/me");
}

export async function serverApiRequest<T>(
  path: string,
  accessToken: string,
  options: RequestOptions = {}
) {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(`${DEFAULT_API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<T>;
}
