"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { apiRequest } from "@/lib/api/client";
import { PageMotion } from "@/components/shared/page-motion";

export function DispensationDetail({ dispensationId }: { dispensationId: string }) {
  const queryClient = useQueryClient();
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const detailQuery = useQuery({
    queryKey: ["dispensation-detail", dispensationId],
    queryFn: () => apiRequest<Record<string, any>>(`/dispensations/${dispensationId}`)
  });
  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: () => apiRequest<Record<string, any>[]>("/students")
  });
  const classesQuery = useQuery({
    queryKey: ["classes"],
    queryFn: () => apiRequest<Record<string, any>[]>("/classes")
  });
  const currentClassId = useMemo(
    () => detailQuery.data?.students?.[0]?.classId ?? classesQuery.data?.[0]?.id ?? "",
    [classesQuery.data, detailQuery.data]
  );

  const addStudentsMutation = useMutation({
    mutationFn: async () =>
      apiRequest(`/dispensations/${dispensationId}/students`, {
        method: "POST",
        body: JSON.stringify({
          classId: currentClassId,
          studentIds: selectedStudentIds
        })
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dispensation-detail", dispensationId] });
      await queryClient.invalidateQueries({ queryKey: ["dispensations"] });
      setSelectedStudentIds([]);
    }
  });

  const publishMutation = useMutation({
    mutationFn: async () =>
      apiRequest(`/dispensations/${dispensationId}/publish`, {
        method: "PATCH"
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dispensation-detail", dispensationId] });
      await queryClient.invalidateQueries({ queryKey: ["dispensations"] });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async () =>
      apiRequest(`/dispensations/${dispensationId}/cancel`, {
        method: "PATCH"
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dispensation-detail", dispensationId] });
      await queryClient.invalidateQueries({ queryKey: ["dispensations"] });
    }
  });

  return (
    <PageMotion>
      <section className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">Kesiswaan</p>
          <h1 className="text-3xl font-semibold">{detailQuery.data?.title ?? "Memuat dispensasi..."}</h1>
          <p className="text-sm text-slate-600">{detailQuery.data?.description ?? "Detail kegiatan dispensasi."}</p>
        </header>

        <div className="rounded-[28px] border border-line bg-surface/85 p-6 shadow-panel">
          <p className="text-sm text-slate-600">
            Status: <span className="font-semibold">{detailQuery.data?.status ?? "-"}</span>
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => publishMutation.mutate()}
              className="rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white"
            >
              {publishMutation.isPending ? "Publishing..." : "Publish"}
            </button>
            <button
              type="button"
              onClick={() => cancelMutation.mutate()}
              className="rounded-full border border-rose-200 px-5 py-3 text-sm font-semibold text-rose-700"
            >
              {cancelMutation.isPending ? "Cancelling..." : "Cancel"}
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[28px] border border-line bg-surface/85 p-6 shadow-panel">
            <h2 className="text-xl font-semibold">Tambahkan siswa</h2>
            <div className="mt-4 grid gap-2">
              {(studentsQuery.data ?? []).map((student) => {
                const checked = selectedStudentIds.includes(student.id);

                return (
                  <label
                    key={student.id}
                    className="flex items-center gap-3 rounded-[18px] border border-line bg-canvas px-4 py-3"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setSelectedStudentIds((current) =>
                          checked ? current.filter((id) => id !== student.id) : [...current, student.id]
                        )
                      }
                    />
                    <span>{student.fullName}</span>
                  </label>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => addStudentsMutation.mutate()}
              className="mt-4 w-full rounded-full border border-line bg-canvas px-5 py-3 text-sm font-semibold"
            >
              {addStudentsMutation.isPending ? "Menambahkan..." : "Tambahkan ke dispensasi"}
            </button>
          </section>

          <section className="rounded-[28px] border border-line bg-surface/85 p-6 shadow-panel">
            <h2 className="text-xl font-semibold">Siswa terpilih</h2>
            <div className="mt-4 grid gap-3">
              {(detailQuery.data?.students ?? []).map((item: any) => (
                <div key={item.studentId} className="rounded-[18px] border border-line bg-canvas px-4 py-3">
                  <p className="font-semibold">{item.student?.fullName ?? item.studentId}</p>
                  <p className="text-sm text-slate-500">{item.class?.name ?? item.classId}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </PageMotion>
  );
}
