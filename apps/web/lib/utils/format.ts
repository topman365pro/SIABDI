import { format } from "date-fns";

export function formatDisplayDate(value?: string | Date | null) {
  if (!value) {
    return "-";
  }

  return format(new Date(value), "dd MMM yyyy");
}

export function formatTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  return value.slice(0, 5);
}

export function titleCase(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
