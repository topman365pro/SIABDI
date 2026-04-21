import { cookies } from "next/headers";
import type { AuthSession } from "@/lib/types";
import { AUTH_COOKIE_NAMES, decodeCurrentUser } from "./session";

export async function getServerSession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.accessToken)?.value;
  const refreshToken = cookieStore.get(AUTH_COOKIE_NAMES.refreshToken)?.value;
  const currentUser = decodeCurrentUser(cookieStore.get(AUTH_COOKIE_NAMES.currentUser)?.value);

  if (!accessToken || !refreshToken || !currentUser) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    user: currentUser
  } satisfies AuthSession;
}
