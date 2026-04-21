import Cookies from "js-cookie";
import type { AuthSession, CurrentUser } from "@/lib/types";

export const AUTH_COOKIE_NAMES = {
  accessToken: "attendance_access_token",
  refreshToken: "attendance_refresh_token",
  currentUser: "attendance_current_user"
} as const;

function encodeCurrentUser(user: CurrentUser) {
  return encodeURIComponent(JSON.stringify(user));
}

export function decodeCurrentUser(value?: string | null): CurrentUser | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(value)) as CurrentUser;
  } catch {
    return null;
  }
}

export function persistSession(session: AuthSession) {
  const options = {
    sameSite: "lax" as const,
    expires: 7
  };

  Cookies.set(AUTH_COOKIE_NAMES.accessToken, session.accessToken, options);
  Cookies.set(AUTH_COOKIE_NAMES.refreshToken, session.refreshToken, options);
  Cookies.set(AUTH_COOKIE_NAMES.currentUser, encodeCurrentUser(session.user), options);
}

export function clearSessionCookies() {
  Cookies.remove(AUTH_COOKIE_NAMES.accessToken);
  Cookies.remove(AUTH_COOKIE_NAMES.refreshToken);
  Cookies.remove(AUTH_COOKIE_NAMES.currentUser);
}

export function getClientSession(): AuthSession | null {
  const accessToken = Cookies.get(AUTH_COOKIE_NAMES.accessToken);
  const refreshToken = Cookies.get(AUTH_COOKIE_NAMES.refreshToken);
  const currentUser = decodeCurrentUser(Cookies.get(AUTH_COOKIE_NAMES.currentUser));

  if (!accessToken || !refreshToken || !currentUser) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    user: currentUser
  };
}
