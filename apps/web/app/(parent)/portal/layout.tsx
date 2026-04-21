import { ParentShell } from "@/components/layout/parent-shell";
import { requireParentSession } from "@/lib/auth/guards";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const session = await requireParentSession();

  return <ParentShell currentUser={session.user}>{children}</ParentShell>;
}
