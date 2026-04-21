"use client";

import { useRouter } from "next/navigation";
import { LogOut, PanelLeft } from "lucide-react";
import { logoutRequest } from "@/lib/api/client";
import type { CurrentUser } from "@/lib/types";

export function Topbar({ currentUser }: { currentUser: CurrentUser }) {
  const router = useRouter();

  async function handleLogout() {
    await logoutRequest();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-canvas/85 px-4 py-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-full border border-line bg-surface lg:hidden">
          <PanelLeft className="size-4" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Aktif</p>
          <h2 className="text-lg font-semibold">{currentUser.fullName}</h2>
        </div>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-medium"
      >
        <LogOut className="size-4" />
        Keluar
      </button>
    </header>
  );
}
