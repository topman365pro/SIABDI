import { AppShell } from "@/components/layout/app-shell";
import { requireInternalSession } from "@/lib/auth/guards";

export default async function InternalLayout({ children }: { children: React.ReactNode }) {
  const session = await requireInternalSession();

  return <AppShell currentUser={session.user}>{children}</AppShell>;
}
