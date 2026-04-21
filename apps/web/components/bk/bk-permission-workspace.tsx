"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/api/client";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageMotion } from "@/components/shared/page-motion";
import { FormField } from "@/components/forms/form-field";
import type { BkPermissionFormInput } from "@/lib/types";
import { useState } from "react";

const schema = z.object({
  studentId: z.string().min(1),
  classId: z.string().min(1),
  attendanceDate: z.string().min(1),
  permissionKind: z.enum(["IZIN", "SAKIT"]),
  startPeriodNo: z.coerce.number().min(1),
  endPeriodNo: z.coerce.number().min(1),
  returnRequired: z.boolean(),
  expectedReturnPeriodNo: z.union([z.coerce.number(), z.undefined()]).optional(),
  reason: z.string().min(1),
  letterNumber: z.string().optional()
});

export function BkPermissionWorkspace() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: () => apiRequest<Record<string, any>[]>("/students")
  });
  const classesQuery = useQuery({
    queryKey: ["classes"],
    queryFn: () => apiRequest<Record<string, any>[]>("/classes")
  });
  const permissionsQuery = useQuery({
    queryKey: ["bk-permissions"],
    queryFn: () => apiRequest<Record<string, any>[]>("/bk-permissions")
  });
  const form = useForm<BkPermissionFormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      attendanceDate: new Date().toISOString().slice(0, 10),
      permissionKind: "IZIN",
      startPeriodNo: 1,
      endPeriodNo: 1,
      returnRequired: false,
      reason: ""
    }
  });

  const createMutation = useMutation({
    mutationFn: async (values: BkPermissionFormInput) =>
      apiRequest("/bk-dashboard/status-overrides", {
        method: "POST",
        body: JSON.stringify(values)
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["bk-permissions"] });
      await queryClient.invalidateQueries({ queryKey: ["bk-overview"] });
      form.reset();
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) =>
      apiRequest(`/bk-dashboard/status-overrides/${id}/cancel`, {
        method: "PATCH"
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["bk-permissions"] });
      setDeleteId(null);
    }
  });

  const fields = [
    {
      name: "studentId",
      label: "Siswa",
      type: "select",
      options: (studentsQuery.data ?? []).map((item) => ({
        value: item.id,
        label: item.fullName
      }))
    },
    {
      name: "classId",
      label: "Kelas",
      type: "select",
      options: (classesQuery.data ?? []).map((item) => ({
        value: item.id,
        label: item.name
      }))
    },
    { name: "attendanceDate", label: "Tanggal", type: "date" },
    {
      name: "permissionKind",
      label: "Jenis Status",
      type: "select",
      options: [
        { value: "IZIN", label: "Izin" },
        { value: "SAKIT", label: "Sakit" }
      ]
    },
    { name: "startPeriodNo", label: "Mulai Jam", type: "number" },
    { name: "endPeriodNo", label: "Sampai Jam", type: "number" },
    { name: "returnRequired", label: "Wajib Kembali", type: "checkbox" },
    { name: "expectedReturnPeriodNo", label: "Jam Kembali", type: "number" },
    { name: "reason", label: "Alasan", type: "textarea" },
    { name: "letterNumber", label: "Nomor Surat", type: "text" }
  ] as const;

  return (
    <PageMotion>
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4 rounded-[28px] border border-line bg-surface/85 p-6 shadow-panel">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">BK</p>
            <h1 className="mt-2 text-3xl font-semibold">Kelola status izin dan sakit</h1>
          </div>
          <DataTable
            columns={[
              { key: "student", label: "Siswa", render: (row) => row.student?.fullName ?? row.studentId },
              { key: "class", label: "Kelas", render: (row) => row.class?.name ?? row.classId },
              { key: "kind", label: "Status", render: (row) => row.permissionKind },
              {
                key: "period",
                label: "Periode",
                render: (row) => `Jam ${row.startPeriodNo} - ${row.endPeriodNo}`
              },
              {
                key: "action",
                label: "Aksi",
                render: (row) => (
                  <button
                    type="button"
                    onClick={() => setDeleteId(row.id)}
                    className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700"
                  >
                    Batalkan
                  </button>
                )
              }
            ]}
            rows={permissionsQuery.data ?? []}
            rowKey={(row) => row.id}
          />
        </div>

        <div className="rounded-[28px] border border-line bg-surface/85 p-6 shadow-panel">
          <h2 className="text-xl font-semibold">Buat override baru</h2>
          <form onSubmit={form.handleSubmit((values) => createMutation.mutate(values))} className="mt-4 space-y-4">
            {fields.map((field) => (
              <FormField
                key={field.name}
                field={field as any}
                control={form.control}
                options={"options" in field ? field.options : undefined}
              />
            ))}
            <button className="w-full rounded-full bg-[var(--color-accent)] px-5 py-3 font-semibold text-white">
              {createMutation.isPending ? "Menyimpan..." : "Simpan Override"}
            </button>
          </form>
        </div>
      </section>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Batalkan status override?"
        description="Sistem akan menghitung ulang status jam terkait setelah override dibatalkan."
        confirmLabel={cancelMutation.isPending ? "Membatalkan..." : "Batalkan Override"}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && cancelMutation.mutate(deleteId)}
      />
    </PageMotion>
  );
}
