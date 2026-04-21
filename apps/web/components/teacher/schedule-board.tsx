"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "@/lib/api/client";
import type { TeacherScheduleItem } from "@/lib/types";
import { FilterBar } from "@/components/shared/filter-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { PageMotion } from "@/components/shared/page-motion";

export function TeacherScheduleBoard({
  mode = "dashboard"
}: {
  mode?: "dashboard" | "schedule";
}) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const schedulesQuery = useQuery({
    queryKey: ["teacher-schedules", date],
    queryFn: () =>
      apiRequest<TeacherScheduleItem[]>(`/teacher/me/schedules?date=${encodeURIComponent(date)}`)
  });

  return (
    <PageMotion>
      <section className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">Guru Mapel</p>
          <h1 className="text-3xl font-semibold">
            {mode === "dashboard" ? "Jam mengajar hari ini" : "Jadwal mengajar"}
          </h1>
          <p className="max-w-3xl text-sm text-slate-600">
            Pilih jam pelajaran untuk melakukan base check atau cross-check kehadiran sesuai jadwal Anda.
          </p>
        </header>

        <FilterBar
          search=""
          onSearchChange={() => undefined}
          date={date}
          onDateChange={setDate}
          showSearch={false}
        />

        {(schedulesQuery.data ?? []).length === 0 ? (
          <EmptyState
            title="Tidak ada jadwal mengajar"
            description="Belum ada jadwal aktif untuk tanggal yang dipilih."
          />
        ) : (
          <div className="grid gap-4">
            {schedulesQuery.data?.map((item) => (
              <Link
                key={item.id}
                href={`/app/guru/kelas/${item.class.id}/periode/${item.lessonPeriodNo}?date=${date}&scheduleId=${item.id}`}
                className="rounded-[26px] border border-line bg-surface/85 p-5 shadow-panel transition hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent)]">
                      {item.lessonPeriod.label}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold">{item.class.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{item.subject.name}</p>
                  </div>
                  <div className="text-right text-sm text-slate-600">
                    <p>{item.lessonPeriod.startTime.slice(0, 5)} - {item.lessonPeriod.endTime.slice(0, 5)}</p>
                    <p className="mt-1">{item.roomName ?? "Ruang belum diisi"}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PageMotion>
  );
}
