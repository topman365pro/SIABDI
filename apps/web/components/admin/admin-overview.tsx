"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import { MetricStrip } from "@/components/shared/metric-strip";
import { PageMotion } from "@/components/shared/page-motion";
import { StatusBadge } from "@/components/shared/status-badge";

export function AdminOverview() {
  const overviewQuery = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () =>
      apiRequest<{
        counters: Record<string, number>;
        attendanceSummary: Record<string, number>;
      }>("/admin/overview")
  });

  const counters = overviewQuery.data?.counters;
  const summary = overviewQuery.data?.attendanceSummary;

  return (
    <PageMotion>
      <section className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Admin / TU
          </p>
          <h1 className="text-3xl font-semibold">Ikhtisar operasional sekolah</h1>
          <p className="max-w-3xl text-sm text-slate-600">
            Lihat distribusi master data dan ringkasan absensi harian sebelum masuk ke modul CRUD.
          </p>
        </header>

        <MetricStrip
          items={[
            { label: "Siswa Aktif", value: counters?.activeStudents ?? "-" },
            { label: "Kelas Aktif", value: counters?.activeClasses ?? "-" },
            { label: "Guru & Staf", value: counters?.staffs ?? "-" },
            { label: "Draft Dispensasi", value: counters?.pendingDraftDispensations ?? "-" }
          ]}
        />

        <section className="rounded-[28px] border border-line bg-surface/85 p-6 shadow-panel">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent)]">Absensi Hari Ini</p>
              <h2 className="mt-2 text-2xl font-semibold">Distribusi status per jam yang sudah tercatat</h2>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {summary
              ? (Object.entries(summary) as Array<[any, number]>).map(([status, count]) => (
                  <div key={status} className="rounded-[22px] border border-line bg-canvas px-4 py-4">
                    <StatusBadge status={status} />
                    <p className="mt-3 text-2xl font-semibold">{count}</p>
                  </div>
                ))
              : "Memuat ringkasan..."}
          </div>
        </section>
      </section>
    </PageMotion>
  );
}
