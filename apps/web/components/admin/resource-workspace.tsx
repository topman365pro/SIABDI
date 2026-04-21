"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import {
  ADMIN_RESOURCES,
  buildResourceSchema,
  type AdminFieldConfig,
  type AdminResourceConfig
} from "@/lib/config/admin-resources";
import { apiRequest } from "@/lib/api/client";
import { PageMotion } from "@/components/shared/page-motion";
import { FilterBar } from "@/components/shared/filter-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type DataColumn } from "@/components/shared/data-table";
import { FormField } from "@/components/forms/form-field";
import { cn } from "@/lib/utils/cn";
import { formatDisplayDate } from "@/lib/utils/format";

function getValueByPath(input: any, path: string) {
  return path.split(".").reduce((value, key) => {
    if (value === null || value === undefined) {
      return null;
    }

    if (/^\d+$/.test(key)) {
      return value[Number(key)];
    }

    return value[key];
  }, input);
}

function normalizeValue(field: AdminFieldConfig, value: unknown) {
  if (field.type === "checkbox") {
    return Boolean(value);
  }

  if (field.type === "number") {
    return value === "" || value === undefined || value === null ? undefined : Number(value);
  }

  return value === "" ? undefined : value;
}

export function AdminResourceWorkspace({ resourceKey }: { resourceKey: string }) {
  const config = ADMIN_RESOURCES[resourceKey];
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeRow, setActiveRow] = useState<Record<string, any> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Record<string, any> | null>(null);
  const schema = useMemo(() => buildResourceSchema(config.fields), [config.fields]);
  const form = useForm<Record<string, any>>({
    resolver: zodResolver(schema),
    defaultValues: config.fields.reduce(
      (accumulator, field) => ({
        ...accumulator,
        [field.name]: field.type === "checkbox" ? false : ""
      }),
      {}
    )
  });

  const listQuery = useQuery({
    queryKey: ["admin-resource", config.key],
    queryFn: () => apiRequest<Record<string, any>[]>(config.endpoint)
  });

  const selectQueries = useQueries({
    queries: config.fields
      .filter((field) => field.selectSource)
      .map((field) => ({
        queryKey: ["admin-select", config.key, field.name],
        queryFn: () => apiRequest<Record<string, any>[]>(field.selectSource!.endpoint)
      }))
  });

  const optionsMap = useMemo(() => {
    let selectQueryIndex = 0;
    const entries = config.fields
      .filter((field) => field.selectSource || field.options)
      .map((field) => {
        if (field.options) {
          return [field.name, field.options] as const;
        }

        const source = field.selectSource!;
        const options = (selectQueries[selectQueryIndex++]?.data ?? []).map((item) => ({
          value: String(getValueByPath(item, source.valueKey)),
          label: String(getValueByPath(item, source.labelKey))
        }));

        return [field.name, options] as const;
      });

    return Object.fromEntries(entries);
  }, [config.fields, selectQueries]);

  const saveMutation = useMutation({
    mutationFn: async (values: Record<string, any>) => {
      const payload = Object.fromEntries(
        config.fields.map((field) => [field.name, normalizeValue(field, values[field.name])])
      );

      if (activeRow) {
        return apiRequest(`${config.endpoint}/${activeRow[config.idKey]}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        });
      }

      return apiRequest(config.createPath ? config.createPath(values) : config.endpoint, {
        method: "POST",
        body: JSON.stringify(payload)
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-resource", config.key] });
      setShowForm(false);
      setActiveRow(null);
      form.reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (row: Record<string, any>) => {
      return apiRequest(`${config.endpoint}/${row[config.idKey]}`, {
        method: "DELETE"
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-resource", config.key] });
      setDeleteTarget(null);
    }
  });

  const columns: Array<DataColumn<Record<string, any>>> = config.columns.map((column) => ({
    key: column.key,
    label: column.label,
    render: (row) => {
      const rawValue = getValueByPath(row, column.key);
      if (typeof rawValue === "boolean") {
        return rawValue ? "Ya" : "Tidak";
      }

      if (column.key.toLowerCase().includes("date") && rawValue) {
        return formatDisplayDate(rawValue);
      }

      return rawValue ?? "-";
    }
  }));

  const filteredRows = (listQuery.data ?? []).filter((row) =>
    JSON.stringify(row).toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setActiveRow(null);
    setShowForm(true);
    form.reset(
      config.fields.reduce(
        (accumulator, field) => ({
          ...accumulator,
          [field.name]: field.type === "checkbox" ? false : ""
        }),
        {}
      )
    );
  }

  function openEdit(row: Record<string, any>) {
    setActiveRow(row);
    setShowForm(true);
    form.reset(
      config.fields.reduce(
        (accumulator, field) => ({
          ...accumulator,
          [field.name]:
            getValueByPath(row, field.name) ??
            row[field.name] ??
            (field.type === "checkbox" ? false : "")
        }),
        {}
      )
    );
  }

  return (
    <PageMotion>
      <section className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Admin / TU
          </p>
          <h1 className="text-3xl font-semibold">{config.title}</h1>
          <p className="max-w-3xl text-sm text-slate-600">{config.subtitle}</p>
        </header>

        <FilterBar
          search={search}
          onSearchChange={setSearch}
          trailing={
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white"
            >
              <Plus className="size-4" />
              Tambah Data
            </button>
          }
        />

        {listQuery.isLoading ? (
          <div className="rounded-[28px] border border-line bg-surface/80 p-6 text-sm text-slate-500">
            Memuat data {config.title.toLowerCase()}...
          </div>
        ) : filteredRows.length === 0 ? (
          <EmptyState
            title={`Belum ada data ${config.title.toLowerCase()}`}
            description="Buat entri pertama agar modul ini bisa dipakai oleh dashboard operasional."
            action={
              <button
                type="button"
                onClick={openCreate}
                className="rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white"
              >
                Tambah Data
              </button>
            }
          />
        ) : (
          <DataTable
            columns={[
              ...columns,
              {
                key: "actions",
                label: "Aksi",
                render: (row) => (
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openEdit(row);
                      }}
                      className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setDeleteTarget(row);
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-rose-700"
                    >
                      <Trash2 className="size-3.5" />
                      Hapus
                    </button>
                  </div>
                )
              }
            ]}
            rows={filteredRows}
            rowKey={(row) => String(row[config.idKey])}
            onRowClick={openEdit}
          />
        )}
      </section>

      {showForm ? (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-slate-950/35 px-4 py-8">
          <div className="mx-auto max-w-2xl rounded-[30px] bg-surface p-6 shadow-panel md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  {activeRow ? "Edit" : "Tambah"}
                </p>
                <h3 className="mt-2 text-2xl font-semibold">{config.title}</h3>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-slate-500">
                Tutup
              </button>
            </div>

            <form
              onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              {config.fields.map((field) => (
                <div
                  key={field.name}
                  className={cn(field.type === "textarea" ? "md:col-span-2" : "")}
                >
                  <FormField field={field} control={form.control} options={optionsMap[field.name] ?? []} />
                </div>
              ))}

              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-full border border-line px-5 py-3 text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white"
                >
                  {saveMutation.isPending ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus data ini?"
        description="Aksi ini akan menghapus data dari modul terkait. Pastikan data tersebut memang tidak lagi dibutuhkan."
        confirmLabel={deleteMutation.isPending ? "Menghapus..." : "Hapus"}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
      />
    </PageMotion>
  );
}
