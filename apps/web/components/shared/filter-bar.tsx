"use client";

import { Search } from "lucide-react";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  trailing?: React.ReactNode;
  date?: string;
  onDateChange?: (value: string) => void;
  showSearch?: boolean;
}

export function FilterBar({
  search,
  onSearchChange,
  trailing,
  date,
  onDateChange,
  showSearch = true
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-[24px] border border-line bg-surface/80 p-4 md:flex-row md:items-center md:justify-between">
      {showSearch ? (
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-line bg-canvas px-4 py-3">
          <Search className="size-4 text-slate-500" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Cari data..."
            className="w-full bg-transparent outline-none placeholder:text-slate-400"
          />
        </label>
      ) : (
        <div />
      )}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {onDateChange ? (
          <input
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="rounded-full border border-line bg-canvas px-4 py-3 outline-none"
          />
        ) : null}
        {trailing}
      </div>
    </div>
  );
}
