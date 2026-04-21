"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/api/client";
import { DataTable } from "@/components/shared/data-table";
import { PageMotion } from "@/components/shared/page-motion";
import { FormField } from "@/components/forms/form-field";
import type { DispensationFormInput } from "@/lib/types";

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  attendanceDate: z.string().min(1),
  startPeriodNo: z.coerce.number().min(1),
  endPeriodNo: z.coerce.number().min(1),
  returnRequired: z.boolean(),
  expectedReturnPeriodNo: z.union([z.coerce.number(), z.undefined()]).optional(),
  letterNumber: z.string().optional()
});

export function DispensationWorkspace() {
  const queryClient = useQueryClient();
  const dispensationsQuery = useQuery({
    queryKey: ["dispensations"],
    queryFn: () => apiRequest<Record<string, any>[]>("/dispensations")
  });
  const form = useForm<DispensationFormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      attendanceDate: new Date().toISOString().slice(0, 10),
      startPeriodNo: 1,
      endPeriodNo: 1,
      returnRequired: false
    }
  });
  const createMutation = useMutation({
    mutationFn: async (values: DispensationFormInput) =>
      apiRequest("/dispensations", {
        method: "POST",
        body: JSON.stringify(values)
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dispensations"] });
      form.reset();
    }
  });

  return (
    <PageMotion>
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4 rounded-[28px] border border-line bg-surface/85 p-6 shadow-panel">
          <header>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">Kesiswaan</p>
            <h1 className="mt-2 text-3xl font-semibold">Draft dan publikasi dispensasi</h1>
          </header>

          <DataTable
            columns={[
              { key: "title", label: "Judul", render: (row) => row.title },
              { key: "status", label: "Status", render: (row) => row.status },
              { key: "date", label: "Tanggal", render: (row) => row.attendanceDate.slice(0, 10) },
              {
                key: "detail",
                label: "Detail",
                render: (row) => (
                  <Link
                    href={`/app/kesiswaan/dispensasi/${row.id}`}
                    className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]"
                  >
                    Buka
                  </Link>
                )
              }
            ]}
            rows={dispensationsQuery.data ?? []}
            rowKey={(row) => row.id}
          />
        </div>

        <div className="rounded-[28px] border border-line bg-surface/85 p-6 shadow-panel">
          <h2 className="text-xl font-semibold">Buat draft dispensasi</h2>
          <form onSubmit={form.handleSubmit((values) => createMutation.mutate(values))} className="mt-4 space-y-4">
            {[
              { name: "title", label: "Judul", type: "text" },
              { name: "description", label: "Deskripsi", type: "textarea" },
              { name: "attendanceDate", label: "Tanggal", type: "date" },
              { name: "startPeriodNo", label: "Mulai Jam", type: "number" },
              { name: "endPeriodNo", label: "Sampai Jam", type: "number" },
              { name: "returnRequired", label: "Wajib Kembali", type: "checkbox" },
              { name: "expectedReturnPeriodNo", label: "Jam Kembali", type: "number" },
              { name: "letterNumber", label: "Nomor Surat", type: "text" }
            ].map((field) => (
              <FormField key={field.name} field={field as any} control={form.control} />
            ))}
            <button className="w-full rounded-full bg-[var(--color-accent)] px-5 py-3 font-semibold text-white">
              {createMutation.isPending ? "Menyimpan..." : "Simpan Draft"}
            </button>
          </form>
        </div>
      </section>
    </PageMotion>
  );
}
