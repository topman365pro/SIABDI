import type { CurrentUser } from "@/lib/types";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({
  currentUser,
  children
}: {
  currentUser: CurrentUser;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar currentUser={currentUser} />
      <div className="min-w-0 flex-1">
        <Topbar currentUser={currentUser} />
        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
