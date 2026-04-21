"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import { PageMotion } from "@/components/shared/page-motion";
import { DataTable } from "@/components/shared/data-table";
import { formatDisplayDate, formatTime } from "@/lib/utils/format";

export function CalendarWorkspace() {
  const calendarDaysQuery = useQuery({
    queryKey: ["calendar-days"],
    queryFn: () => apiRequest<Record<string, any>[]>("/calendar-days")
  });
  const overridesQuery = useQuery({
    queryKey: ["daily-period-overrides"],
    queryFn: () => apiRequest<Record<string, any>[]>("/daily-period-overrides")
  });

  return (
    <PageMotion>
      <section className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">Admin / TU</p>
          <h1 className="text-3xl font-semibold">Kalender & Override Jam</h1>
          <p className="max-w-3xl text-sm text-slate-600">
            Monitoring hari sekolah dan perubahan jadwal khusus. CRUD penuh dapat dilanjutkan melalui iterasi
            berikutnya tanpa mengubah struktur halaman ini.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Hari Kalender Akademik</h2>
          <DataTable
            columns={[
              { key: "calendarDate", label: "Tanggal", render: (row) => formatDisplayDate(row.calendarDate) },
              { key: "title", label: "Judul", render: (row) => row.title },
              { key: "dayType", label: "Tipe Hari", render: (row) => row.dayType },
              { key: "isSchoolDay", label: "Hari Sekolah", render: (row) => (row.isSchoolDay ? "Ya" : "Tidak") }
            ]}
            rows={calendarDaysQuery.data ?? []}
            rowKey={(row) => row.calendarDate}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Override Jam Pelajaran</h2>
          <DataTable
            columns={[
              { key: "calendarDate", label: "Tanggal", render: (row) => formatDisplayDate(row.calendarDate) },
              { key: "lessonPeriodNo", label: "Periode", render: (row) => row.lessonPeriodNo },
              { key: "label", label: "Label", render: (row) => row.label },
              { key: "startTime", label: "Mulai", render: (row) => formatTime(row.startTime) },
              { key: "endTime", label: "Selesai", render: (row) => formatTime(row.endTime) }
            ]}
            rows={overridesQuery.data ?? []}
            rowKey={(row) => row.id}
          />
        </section>
      </section>
    </PageMotion>
  );
}
