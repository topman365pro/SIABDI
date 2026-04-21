"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "@/lib/api/client";
import { FilterBar } from "@/components/shared/filter-bar";
import { StatusBadge } from "@/components/shared/status-badge";

export function BkClassRoster({ classId }: { classId: string }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [periodNo, setPeriodNo] = useState("1");
  const rosterQuery = useQuery({
    queryKey: ["bk-class-roster", classId, date, periodNo],
    queryFn: () =>
      apiRequest<Array<Record<string, any>>>(
        `/bk-dashboard/classes/${classId}/students?date=${encodeURIComponent(date)}&periodNo=${periodNo}`
      )
  });

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">BK</p>
        <h1 className="text-3xl font-semibold">Status kelas per jam</h1>
      </header>
      <FilterBar
        search=""
        onSearchChange={() => undefined}
        date={date}
        onDateChange={setDate}
        showSearch={false}
        trailing={
          <input
            type="number"
            min={1}
            max={10}
            value={periodNo}
            onChange={(event) => setPeriodNo(event.target.value)}
            className="rounded-full border border-line bg-canvas px-4 py-3 outline-none"
          />
        }
      />
      <div className="grid gap-3">
        {(rosterQuery.data ?? []).map((item) => (
          <div key={item.student.id} className="rounded-[24px] border border-line bg-surface/85 p-4 shadow-panel">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{item.student.fullName}</p>
                <p className="text-sm text-slate-500">{item.student.nis}</p>
              </div>
              {item.status ? <StatusBadge status={item.status.status} /> : <span className="text-sm">Belum ada</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
