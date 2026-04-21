"use client";

import { ATTENDANCE_STATUS_MAP } from "@/lib/config/status";
import type { AttendanceStatus } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

const toneClasses = {
  neutral: "bg-muted text-ink",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-rose-100 text-rose-800",
  accent: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
};

export function StatusBadge({ status }: { status: AttendanceStatus }) {
  const config = ATTENDANCE_STATUS_MAP[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase",
        toneClasses[config.tone]
      )}
    >
      {config.label}
    </span>
  );
}
