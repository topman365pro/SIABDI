import type { AttendanceStatus, AttendanceStatusViewModel } from "@/lib/types";

export const ATTENDANCE_STATUS_MAP: Record<AttendanceStatus, AttendanceStatusViewModel> = {
  HADIR: {
    value: "HADIR",
    label: "Masuk",
    tone: "success"
  },
  ALFA: {
    value: "ALFA",
    label: "Alfa",
    tone: "neutral"
  },
  IZIN: {
    value: "IZIN",
    label: "Izin",
    tone: "accent"
  },
  SAKIT: {
    value: "SAKIT",
    label: "Sakit",
    tone: "warning"
  },
  DISPENSASI: {
    value: "DISPENSASI",
    label: "Dispensasi",
    tone: "accent"
  },
  BOLOS: {
    value: "BOLOS",
    label: "Bolos",
    tone: "danger"
  }
};
