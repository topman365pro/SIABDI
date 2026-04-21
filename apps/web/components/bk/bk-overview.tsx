"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import { MetricStrip } from "@/components/shared/metric-strip";
import { PageMotion } from "@/components/shared/page-motion";

export function BkOverview() {
  const overviewQuery = useQuery({
    queryKey: ["bk-overview"],
    queryFn: () =>
      apiRequest<{
        counters: Record<string, number>;
        latestPermissions: Array<Record<string, any>>;
      }>("/bk/overview")
  });

  return (
    <PageMotion>
      <section className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">BK</p>
          <h1 className="text-3xl font-semibold">Ikhtisar izin dan sakit</h1>
          <p className="max-w-3xl text-sm text-slate-600">
            Pantau override aktif, kewajiban kembali, dan entri terbaru dari dashboard BK.
          </p>
        </header>

        <MetricStrip
          items={[
            { label: "Izin/Sakit Aktif", value: overviewQuery.data?.counters.activePermissions ?? "-" },
            { label: "Sakit Aktif", value: overviewQuery.data?.counters.sakitAktif ?? "-" },
            { label: "Izin Aktif", value: overviewQuery.data?.counters.izinAktif ?? "-" },
            { label: "Wajib Kembali", value: overviewQuery.data?.counters.returnRequired ?? "-" }
          ]}
        />

        <section className="rounded-[28px] border border-line bg-surface/85 p-6 shadow-panel">
          <h2 className="text-2xl font-semibold">Entri terbaru</h2>
          <div className="mt-4 grid gap-3">
            {(overviewQuery.data?.latestPermissions ?? []).map((item) => (
              <div key={item.id} className="rounded-[22px] border border-line bg-canvas p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">{item.student.fullName}</p>
                    <p className="text-sm text-slate-500">{item.class.name}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold">{item.permissionKind}</p>
                    <p className="text-slate-500">
                      Jam {item.startPeriodNo} - {item.endPeriodNo}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </PageMotion>
  );
}
