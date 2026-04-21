"use client";

import { Controller } from "react-hook-form";
import type { AdminFieldConfig } from "@/lib/config/admin-resources";

interface FormFieldProps {
  field: AdminFieldConfig;
  control: any;
  options?: ReadonlyArray<{ value: string; label: string }>;
}

export function FormField({ field, control, options = [] }: FormFieldProps) {
  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: controllerField, fieldState }) => (
        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {field.label}
          </span>
          {field.type === "textarea" ? (
            <textarea
              {...controllerField}
              rows={4}
              className="w-full rounded-[18px] border border-line bg-canvas px-4 py-3 outline-none"
            />
          ) : field.type === "select" ? (
            <select
              {...controllerField}
              className="w-full rounded-[18px] border border-line bg-canvas px-4 py-3 outline-none"
            >
              <option value="">Pilih...</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : field.type === "checkbox" ? (
            <span className="flex items-center gap-3 rounded-[18px] border border-line bg-canvas px-4 py-3">
              <input
                type="checkbox"
                checked={Boolean(controllerField.value)}
                onChange={(event) => controllerField.onChange(event.target.checked)}
              />
              <span className="text-sm text-slate-700">Aktifkan nilai ini</span>
            </span>
          ) : (
            <input
              {...controllerField}
              type={field.type}
              className="w-full rounded-[18px] border border-line bg-canvas px-4 py-3 outline-none"
            />
          )}
          {fieldState.error ? (
            <p className="text-sm text-[var(--color-danger)]">{fieldState.error.message}</p>
          ) : null}
        </label>
      )}
    />
  );
}
