"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import type { ParentStudentSummary } from "@/lib/types";
import { PageMotion } from "@/components/shared/page-motion";

export function ChildrenOverview() {
  const childrenQuery = useQuery({
    queryKey: ["parent-students"],
    queryFn: () => apiRequest<ParentStudentSummary[]>("/parent/me/students")
  });

  return (
    <PageMotion>
      <section className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">Portal Orang Tua</p>
          <h1 className="text-3xl font-semibold">Data anak terhubung</h1>
          <p className="max-w-3xl text-sm text-slate-600">
            Pilih anak untuk melihat status hari ini atau histori kehadiran.
          </p>
        </header>

        <div className="grid gap-4">
          {(childrenQuery.data ?? []).map((child) => (
            <div key={child.id} className="rounded-[28px] border border-line bg-surface/90 p-5 shadow-panel">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent)]">{child.relationship}</p>
              <h2 className="mt-2 text-2xl font-semibold">{child.fullName}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {child.currentClass?.name ?? "Kelas belum terhubung"} · NIS {child.nis}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/portal/anak/${child.id}/hari-ini`}
                  className="rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white"
                >
                  Lihat Hari Ini
                </Link>
                <Link
                  href={`/portal/anak/${child.id}/riwayat`}
                  className="rounded-full border border-line px-5 py-3 text-sm font-semibold"
                >
                  Lihat Riwayat
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageMotion>
  );
}
