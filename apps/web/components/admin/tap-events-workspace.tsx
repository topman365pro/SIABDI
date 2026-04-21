"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import { DataTable } from "@/components/shared/data-table";
import { PageMotion } from "@/components/shared/page-motion";
import { formatDisplayDate } from "@/lib/utils/format";

export function TapEventsWorkspace() {
  const tapEventsQuery = useQuery({
    queryKey: ["tap-events"],
    queryFn: () => apiRequest<Record<string, any>[]>("/tap-events")
  });

  return (
    <PageMotion>
      <section className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">Admin / TU</p>
          <h1 className="text-3xl font-semibold">Tap Events</h1>
          <p className="max-w-3xl text-sm text-slate-600">
            Placeholder integrasi barcode, RFID, atau NFC. Event mentah disimpan untuk kebutuhan IoT berikutnya.
          </p>
        </header>

        <DataTable
          columns={[
            { key: "nisInput", label: "NIS", render: (row) => row.nisInput },
            { key: "tapType", label: "Tipe Tap", render: (row) => row.tapType },
            { key: "tappedAt", label: "Waktu", render: (row) => formatDisplayDate(row.tappedAt) },
            { key: "processingStatus", label: "Status", render: (row) => row.processingStatus },
            { key: "externalEventId", label: "External ID", render: (row) => row.externalEventId ?? "-" }
          ]}
          rows={tapEventsQuery.data ?? []}
          rowKey={(row) => row.id}
        />
      </section>
    </PageMotion>
  );
}
