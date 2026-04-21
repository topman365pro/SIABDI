"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { NAVIGATION } from "@/lib/config/navigation";
import { getPrimaryRole } from "@/lib/auth/roles";
import type { CurrentUser } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

export function Sidebar({ currentUser }: { currentUser: CurrentUser }) {
  const pathname = usePathname();
  const primaryRole = getPrimaryRole(currentUser.roleCodes);
  const navigation = primaryRole ? NAVIGATION[primaryRole] : [];

  return (
    <aside className="glass-panel shell-grid hidden min-h-screen w-[280px] shrink-0 border-r border-line p-6 lg:block">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
          Sistem Absensi
        </p>
        <h1 className="text-2xl font-semibold leading-tight">Operasional Sekolah</h1>
        <p className="max-w-[16rem] text-sm text-slate-600">
          Workspace ringkas untuk absensi per jam, status BK, dispensasi, dan monitoring parent.
        </p>
      </div>

      <nav className="mt-10 space-y-2">
        {navigation.map((item) => {
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative block overflow-hidden rounded-[20px] px-4 py-3 transition",
                active ? "bg-surface text-ink shadow-panel" : "hover:bg-surface/60"
              )}
            >
              {active ? (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-[var(--color-accent)]"
                />
              ) : null}
              <div className="pl-2">
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-1 text-xs text-slate-500">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
