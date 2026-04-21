import { redirect } from "next/navigation";
import { requireInternalSession } from "@/lib/auth/guards";
import { getPrimaryRole, getRoleHomePath } from "@/lib/auth/roles";

export default async function AppIndexPage() {
  const session = await requireInternalSession();
  const primaryRole = getPrimaryRole(session.user.roleCodes);
  redirect(primaryRole ? getRoleHomePath(primaryRole) : "/login");
}
