"use client";

import { cn } from "@/lib/utils/cn";

export interface DataColumn<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Array<DataColumn<T>>;
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({ columns, rows, rowKey, onRowClick }: DataTableProps<T>) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-[28px] border border-line bg-surface/85 shadow-panel lg:block">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-line bg-canvas/70">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-b border-line/70 align-top last:border-b-0",
                  onRowClick ? "cursor-pointer transition hover:bg-[var(--color-accent-soft)]" : ""
                )}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-5 py-4 text-sm text-slate-700">
                    {column.render ? column.render(row) : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 lg:hidden">
        {rows.map((row) => (
          <button
            key={rowKey(row)}
            type="button"
            onClick={() => onRowClick?.(row)}
            className="rounded-[24px] border border-line bg-surface/85 p-4 text-left shadow-panel"
          >
            {columns.map((column) => (
              <div
                key={column.key}
                className="flex items-start justify-between gap-3 border-b border-line/70 py-2 last:border-b-0 last:pb-0 first:pt-0"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {column.label}
                </span>
                <span className="max-w-[65%] text-right text-sm text-slate-700">
                  {column.render ? column.render(row) : null}
                </span>
              </div>
            ))}
          </button>
        ))}
      </div>
    </>
  );
}
