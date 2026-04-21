"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/lib/api/client";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageMotion } from "@/components/shared/page-motion";

export function TeacherPeriodWorkspace({
  classId,
  periodNo
}: {
  classId: string;
  periodNo: number;
}) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const scheduleId = searchParams.get("scheduleId") ?? "";
  const [records, setRecords] = useState<Record<string, any>>({});
  const periodQuery = useQuery({
    queryKey: ["teacher-period", classId, periodNo, date],
    queryFn: () =>
      apiRequest<{ schedule: Record<string, any>; roster: Array<Record<string, any>> }>(
        `/teacher/me/classes/${classId}/periods/${periodNo}?date=${encodeURIComponent(date)}`
      )
  });

  const verifyMutation = useMutation({
    mutationFn: async () =>
      apiRequest(`/teacher/me/classes/${classId}/periods/${periodNo}/verify`, {
        method: "POST",
        body: JSON.stringify({
          attendanceDate: date,
          scheduleId,
          lessonPeriodNo: periodNo,
          records: (periodQuery.data?.roster ?? []).map((row) => ({
            studentId: row.student.id,
            status: periodNo === 1 ? (records[row.student.id] ?? "ALFA") : undefined,
            teacherObservation: periodNo > 1 ? (records[row.student.id] ?? "ABSENT") : undefined,
            note: row.status?.note
          }))
        })
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["teacher-period", classId, periodNo, date]
      });
    }
  });

  return (
    <PageMotion>
      <section className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">Guru Mapel</p>
          <h1 className="text-3xl font-semibold">
            {periodQuery.data?.schedule.class.name ?? "Memuat kelas"} · Periode {periodNo}
          </h1>
          <p className="max-w-3xl text-sm text-slate-600">
            {periodNo === 1
              ? "Jam pertama membentuk baseline hari itu. Tandai Masuk atau Alfa."
              : "Pergantian jam pelajaran wajib diverifikasi untuk mendeteksi bolos tanpa izin."}
          </p>
        </header>

        <div className="grid gap-3">
          {(periodQuery.data?.roster ?? []).map((row) => (
            <div
              key={row.student.id}
              className="rounded-[24px] border border-line bg-surface/85 p-4 shadow-panel"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{row.student.fullName}</p>
                  <p className="text-sm text-slate-500">{row.student.nis}</p>
                </div>
                {row.status ? <StatusBadge status={row.status.status} /> : <span className="text-sm">Belum ada</span>}
              </div>
              <div className="mt-4 flex gap-2">
                {(periodNo === 1
                  ? [
                      { value: "HADIR", label: "Masuk" },
                      { value: "ALFA", label: "Alfa" }
                    ]
                  : [
                      { value: "PRESENT", label: "Ada di kelas" },
                      { value: "ABSENT", label: "Tidak ada" }
                    ]
                ).map((option) => {
                  const active = records[row.student.id] === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setRecords((current) => ({
                          ...current,
                          [row.student.id]: option.value
                        }))
                      }
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? "bg-[var(--color-accent)] text-white"
                          : "border border-line bg-canvas text-slate-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-4 z-10 rounded-[26px] border border-line bg-surface/90 p-4 shadow-panel backdrop-blur lg:static">
          <button
            type="button"
            onClick={() => verifyMutation.mutate()}
            disabled={verifyMutation.isPending}
            className="w-full rounded-full bg-[var(--color-accent)] px-5 py-3 font-semibold text-white"
          >
            {verifyMutation.isPending ? "Menyimpan verifikasi..." : "Simpan Verifikasi"}
          </button>
        </div>
      </section>
    </PageMotion>
  );
}
