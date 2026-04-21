import { z } from "zod";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "time"
  | "checkbox"
  | "select";

export interface SelectSource {
  endpoint: string;
  valueKey: string;
  labelKey: string;
}

export interface AdminFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  selectSource?: SelectSource;
  options?: Array<{ value: string; label: string }>;
}

export interface AdminColumnConfig {
  key: string;
  label: string;
}

export interface AdminResourceConfig {
  key: string;
  title: string;
  subtitle: string;
  endpoint: string;
  idKey: string;
  fields: AdminFieldConfig[];
  columns: AdminColumnConfig[];
  createPath?: (values: Record<string, unknown>) => string;
}

const weekdayOptions = [
  { value: "MONDAY", label: "Senin" },
  { value: "TUESDAY", label: "Selasa" },
  { value: "WEDNESDAY", label: "Rabu" },
  { value: "THURSDAY", label: "Kamis" },
  { value: "FRIDAY", label: "Jumat" },
  { value: "SATURDAY", label: "Sabtu" }
];

const genderOptions = [
  { value: "L", label: "Laki-laki" },
  { value: "P", label: "Perempuan" }
];

export const ADMIN_RESOURCES: Record<string, AdminResourceConfig> = {
  batches: {
    key: "batches",
    title: "Angkatan",
    subtitle: "Kelola batch masuk siswa berdasarkan tahun masuk.",
    endpoint: "/batches",
    idKey: "id",
    columns: [
      { key: "name", label: "Nama" },
      { key: "entryYear", label: "Tahun Masuk" },
      { key: "description", label: "Keterangan" }
    ],
    fields: [
      { name: "name", label: "Nama Angkatan", type: "text", required: true },
      { name: "entryYear", label: "Tahun Masuk", type: "number", required: true },
      { name: "description", label: "Deskripsi", type: "textarea" }
    ]
  },
  "academic-years": {
    key: "academic-years",
    title: "Tahun Ajaran",
    subtitle: "Kontrol periode akademik aktif dan tanggal operasional sekolah.",
    endpoint: "/academic-years",
    idKey: "id",
    columns: [
      { key: "name", label: "Nama" },
      { key: "startDate", label: "Mulai" },
      { key: "endDate", label: "Selesai" },
      { key: "isActive", label: "Aktif" }
    ],
    fields: [
      { name: "name", label: "Nama Tahun Ajaran", type: "text", required: true },
      { name: "startDate", label: "Tanggal Mulai", type: "date", required: true },
      { name: "endDate", label: "Tanggal Selesai", type: "date", required: true },
      { name: "isActive", label: "Jadikan Aktif", type: "checkbox" }
    ]
  },
  classes: {
    key: "classes",
    title: "Kelas",
    subtitle: "Susun kelas aktif per tahun ajaran dan wali kelas.",
    endpoint: "/classes",
    idKey: "id",
    columns: [
      { key: "name", label: "Nama Kelas" },
      { key: "batch.name", label: "Angkatan" },
      { key: "academicYear.name", label: "Tahun Ajaran" },
      { key: "homeroomStaff.fullName", label: "Wali Kelas" }
    ],
    fields: [
      {
        name: "batchId",
        label: "Angkatan",
        type: "select",
        required: true,
        selectSource: { endpoint: "/batches", valueKey: "id", labelKey: "name" }
      },
      {
        name: "academicYearId",
        label: "Tahun Ajaran",
        type: "select",
        required: true,
        selectSource: { endpoint: "/academic-years", valueKey: "id", labelKey: "name" }
      },
      { name: "name", label: "Nama Kelas", type: "text", required: true },
      { name: "gradeLevel", label: "Tingkat", type: "number", required: true },
      { name: "major", label: "Jurusan", type: "text" },
      { name: "parallelCode", label: "Paralel", type: "text" },
      {
        name: "homeroomStaffId",
        label: "Wali Kelas",
        type: "select",
        selectSource: { endpoint: "/staffs", valueKey: "id", labelKey: "fullName" }
      },
      { name: "isActive", label: "Aktif", type: "checkbox" }
    ]
  },
  students: {
    key: "students",
    title: "Siswa",
    subtitle: "Master identitas siswa, NIS, dan placeholder barcode/RFID.",
    endpoint: "/students",
    idKey: "id",
    columns: [
      { key: "nis", label: "NIS" },
      { key: "fullName", label: "Nama" },
      { key: "batch.name", label: "Angkatan" },
      { key: "enrollments.0.class.name", label: "Kelas Aktif" }
    ],
    fields: [
      {
        name: "batchId",
        label: "Angkatan",
        type: "select",
        required: true,
        selectSource: { endpoint: "/batches", valueKey: "id", labelKey: "name" }
      },
      { name: "nis", label: "NIS", type: "text", required: true },
      { name: "fullName", label: "Nama Lengkap", type: "text", required: true },
      { name: "gender", label: "Gender", type: "select", options: genderOptions },
      { name: "birthDate", label: "Tanggal Lahir", type: "date" },
      { name: "barcodeValue", label: "Barcode", type: "text" },
      { name: "rfidUid", label: "RFID UID", type: "text" },
      { name: "isActive", label: "Aktif", type: "checkbox" }
    ]
  },
  enrollments: {
    key: "enrollments",
    title: "Enrollment",
    subtitle: "Kelola penempatan siswa ke kelas aktif.",
    endpoint: "/enrollments",
    idKey: "id",
    createPath: (values) => `/students/${values.studentId}/enrollments`,
    columns: [
      { key: "student.fullName", label: "Siswa" },
      { key: "class.name", label: "Kelas" },
      { key: "startDate", label: "Mulai" },
      { key: "isActive", label: "Aktif" }
    ],
    fields: [
      {
        name: "studentId",
        label: "Siswa",
        type: "select",
        required: true,
        selectSource: { endpoint: "/students", valueKey: "id", labelKey: "fullName" }
      },
      {
        name: "classId",
        label: "Kelas",
        type: "select",
        required: true,
        selectSource: { endpoint: "/classes", valueKey: "id", labelKey: "name" }
      },
      { name: "startDate", label: "Tanggal Mulai", type: "date", required: true },
      { name: "endDate", label: "Tanggal Selesai", type: "date" },
      { name: "isActive", label: "Aktif", type: "checkbox" }
    ]
  },
  staffs: {
    key: "staffs",
    title: "Guru & Staf",
    subtitle: "Master identitas tenaga pendidik dan pegawai.",
    endpoint: "/staffs",
    idKey: "id",
    columns: [
      { key: "fullName", label: "Nama" },
      { key: "employeeNumber", label: "NIP/NIK" },
      { key: "positions.0.position.name", label: "Posisi Utama" }
    ],
    fields: [
      { name: "fullName", label: "Nama Lengkap", type: "text", required: true },
      { name: "employeeNumber", label: "NIP / NIK", type: "text", required: true }
    ]
  },
  parents: {
    key: "parents",
    title: "Orang Tua",
    subtitle: "Kelola akun parent yang dapat memantau histori kehadiran.",
    endpoint: "/parents",
    idKey: "id",
    columns: [
      { key: "fullName", label: "Nama" },
      { key: "phone", label: "Telepon" },
      { key: "email", label: "Email" }
    ],
    fields: [
      { name: "fullName", label: "Nama Lengkap", type: "text", required: true },
      { name: "phone", label: "Nomor Telepon", type: "text" },
      { name: "email", label: "Email", type: "text" }
    ]
  },
  subjects: {
    key: "subjects",
    title: "Mata Pelajaran",
    subtitle: "Master data kode dan nama mapel aktif.",
    endpoint: "/subjects",
    idKey: "id",
    columns: [
      { key: "code", label: "Kode" },
      { key: "name", label: "Nama" },
      { key: "isActive", label: "Aktif" }
    ],
    fields: [
      { name: "code", label: "Kode Mapel", type: "text", required: true },
      { name: "name", label: "Nama Mapel", type: "text", required: true },
      { name: "isActive", label: "Aktif", type: "checkbox" }
    ]
  },
  "lesson-periods": {
    key: "lesson-periods",
    title: "Jam Pelajaran",
    subtitle: "Atur label dan waktu untuk setiap jam pelajaran.",
    endpoint: "/lesson-periods",
    idKey: "periodNo",
    columns: [
      { key: "periodNo", label: "Periode" },
      { key: "label", label: "Label" },
      { key: "startTime", label: "Mulai" },
      { key: "endTime", label: "Selesai" }
    ],
    fields: [
      { name: "periodNo", label: "Nomor Periode", type: "number", required: true },
      { name: "label", label: "Label", type: "text", required: true },
      { name: "startTime", label: "Jam Mulai", type: "time", required: true },
      { name: "endTime", label: "Jam Selesai", type: "time", required: true },
      { name: "isActive", label: "Aktif", type: "checkbox" }
    ]
  },
  schedules: {
    key: "schedules",
    title: "Jadwal",
    subtitle: "Hubungkan kelas, guru, mapel, dan jam mengajar.",
    endpoint: "/schedules",
    idKey: "id",
    columns: [
      { key: "class.name", label: "Kelas" },
      { key: "subject.name", label: "Mapel" },
      { key: "teacher.fullName", label: "Guru" },
      { key: "lessonPeriod.label", label: "Jam" }
    ],
    fields: [
      {
        name: "academicYearId",
        label: "Tahun Ajaran",
        type: "select",
        required: true,
        selectSource: { endpoint: "/academic-years", valueKey: "id", labelKey: "name" }
      },
      {
        name: "classId",
        label: "Kelas",
        type: "select",
        required: true,
        selectSource: { endpoint: "/classes", valueKey: "id", labelKey: "name" }
      },
      {
        name: "subjectId",
        label: "Mapel",
        type: "select",
        required: true,
        selectSource: { endpoint: "/subjects", valueKey: "id", labelKey: "name" }
      },
      {
        name: "teacherStaffId",
        label: "Guru",
        type: "select",
        required: true,
        selectSource: { endpoint: "/staffs", valueKey: "id", labelKey: "fullName" }
      },
      { name: "weekday", label: "Hari", type: "select", required: true, options: weekdayOptions },
      {
        name: "lessonPeriodNo",
        label: "Jam Pelajaran",
        type: "select",
        required: true,
        selectSource: { endpoint: "/lesson-periods", valueKey: "periodNo", labelKey: "label" }
      },
      { name: "roomName", label: "Ruang", type: "text" },
      { name: "isActive", label: "Aktif", type: "checkbox" }
    ]
  }
};

export function buildResourceSchema(fields: AdminFieldConfig[]) {
  return z.object(
    Object.fromEntries(
      fields.map((field) => {
        let schema: z.ZodTypeAny;

        switch (field.type) {
          case "checkbox":
            schema = z.boolean().default(false);
            break;
          case "number":
            schema = field.required ? z.coerce.number() : z.coerce.number().optional();
            break;
          default:
            schema = field.required ? z.string().min(1, `${field.label} wajib diisi.`) : z.string().optional();
        }

        if (!field.required && field.type !== "checkbox" && field.type !== "number") {
          schema = z.preprocess((value) => (value === "" ? undefined : value), schema);
        }

        return [field.name, schema];
      })
    )
  );
}
