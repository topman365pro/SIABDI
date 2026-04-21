import type { RoleCode } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  description: string;
}

export const NAVIGATION: Record<RoleCode, NavItem[]> = {
  ADMIN_TU: [
    { href: "/app/admin/overview", label: "Ikhtisar", description: "Ringkasan sekolah" },
    { href: "/app/admin/batches", label: "Angkatan", description: "Batch siswa" },
    { href: "/app/admin/academic-years", label: "Tahun Ajaran", description: "Kalender akademik" },
    { href: "/app/admin/classes", label: "Kelas", description: "Kelas aktif" },
    { href: "/app/admin/students", label: "Siswa", description: "Master siswa" },
    { href: "/app/admin/enrollments", label: "Enrollment", description: "Riwayat kelas" },
    { href: "/app/admin/staffs", label: "Guru & Staf", description: "Data pegawai" },
    { href: "/app/admin/parents", label: "Orang Tua", description: "Akun parent" },
    { href: "/app/admin/subjects", label: "Mapel", description: "Master mapel" },
    { href: "/app/admin/lesson-periods", label: "Jam Pelajaran", description: "Jam sekolah" },
    { href: "/app/admin/schedules", label: "Jadwal", description: "Jadwal kelas" },
    { href: "/app/admin/calendar", label: "Kalender", description: "Hari sekolah dan override" },
    { href: "/app/admin/tap-events", label: "Tap Events", description: "Event scanner" }
  ],
  BK: [
    { href: "/app/bk/dashboard", label: "Ikhtisar BK", description: "Status hari ini" },
    { href: "/app/bk/izin-sakit", label: "Izin & Sakit", description: "Kelola surat BK" }
  ],
  KESISWAAN: [
    { href: "/app/kesiswaan/dashboard", label: "Ikhtisar Kesiswaan", description: "Dispensasi aktif" },
    { href: "/app/kesiswaan/dispensasi", label: "Dispensasi", description: "Draft dan publish" }
  ],
  GURU_MAPEL: [
    { href: "/app/guru/dashboard", label: "Dashboard Guru", description: "Jam berjalan" },
    { href: "/app/guru/jadwal", label: "Jadwal", description: "Agenda mengajar" }
  ],
  ORANG_TUA: [
    { href: "/portal", label: "Portal", description: "Ringkasan anak" },
    { href: "/portal/anak", label: "Data Anak", description: "Timeline kehadiran" }
  ]
};
