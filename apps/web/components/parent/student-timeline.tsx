"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "@/lib/api/client";
import type { StudentHistoryEntry } from "@/lib/types";
import { FilterBar } from "@/components/shared/filter-bar";
import { PageMotion } from "@/components/shared/page-motion";
import { StatusBadge } from "@/components/shared/status-badge";

export function StudentTimeline({
  studentId,
  mode
}: {
  studentId: string;
  mode: "today" | "history";
}) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const historyQuery = useQuery({
    queryKey: ["parent-student-timeline", studentId, mode, date],
    queryFn: () =>
      apiRequest<StudentHistoryEntry[]>(
        mode === "today"
          ? `/parent/me/students/${studentId}/today?date=${encodeURIComponent(date)}`
          : `/parent/me/students/${studentId}/history?startDate=${encodeURIComponent(
              `${date.slice(0, 8)}01`
            )}&endDate=${encodeURIComponent(date)}`
      )
  });

  return (
    <PageMotion>
      <section className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">Portal Orang Tua</p>
          <h1 className="text-3xl font-semibold">
            {mode === "today" ? "Status kehadiran hari ini" : "Riwayat kehadiran"}
          </h1>
        </header>

        <FilterBar
          search=""
          onSearchChange={() => undefined}
          date={date}
          onDateChange={setDate}
          showSearch={false}
        />

        <div className="grid gap-3">
          {(historyQuery.data ?? []).map((entry) => (
            <div key={entry.id} className="rounded-[24px] border border-line bg-surface/90 p-5 shadow-panel">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Jam ke-{entry.lessonPeriodNo}</p>
                  <p className="mt-1 font-semibold">{entry.note ?? "Status tercatat otomatis."}</p>
                </div>
                <StatusBadge status={entry.status} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageMotion>
  );
}
