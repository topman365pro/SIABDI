"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, LogOut } from "lucide-react";
import { logoutRequest } from "@/lib/api/client";
import type { CurrentUser } from "@/lib/types";

export function ParentShell({
  currentUser,
  children
}: {
  currentUser: CurrentUser;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f3ea_0%,#ffffff_100%)]">
      <header className="border-b border-line bg-surface/90 px-4 py-5 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">Portal Orang Tua</p>
            <h1 className="mt-1 text-xl font-semibold">Pantau kehadiran anak secara real-time</h1>
          </div>
          <button
            type="button"
            onClick={async () => {
              await logoutRequest();
              router.replace("/login");
            }}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-canvas px-4 py-2 text-sm"
          >
            <LogOut className="size-4" />
            Keluar
          </button>
        </div>
      </header>
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-4 text-sm text-slate-500">
        <Link href="/portal" className="font-medium text-slate-700">
          {currentUser.fullName}
        </Link>
        <ChevronRight className="size-4" />
        <span>Monitoring Kehadiran</span>
      </div>
      <main className="mx-auto max-w-5xl px-4 pb-10">{children}</main>
    </div>
  );
}
