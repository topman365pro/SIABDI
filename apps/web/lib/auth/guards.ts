import { redirect } from "next/navigation";
import { getPrimaryRole, getRoleHomePath } from "./roles";
import { getServerSession } from "./server-session";

export async function redirectIfAuthenticated() {
  const session = await getServerSession();

  if (session) {
    const primaryRole = getPrimaryRole(session.user.roleCodes);
    redirect(primaryRole ? getRoleHomePath(primaryRole) : "/login");
  }
}

export async function requireInternalSession() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const primaryRole = getPrimaryRole(session.user.roleCodes);

  if (primaryRole === "ORANG_TUA") {
    redirect("/portal");
  }

  return session;
}

export async function requireParentSession() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.roleCodes.includes("ORANG_TUA")) {
    const primaryRole = getPrimaryRole(session.user.roleCodes);
    redirect(primaryRole ? getRoleHomePath(primaryRole) : "/login");
  }

  return session;
}
