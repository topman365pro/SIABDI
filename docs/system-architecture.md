# Sistem Informasi Absensi Terintegrasi Sekolah

## 1. Rekomendasi Tech Stack

### Frontend
- Next.js + TypeScript
- Tailwind CSS
- TanStack Query
- React Hook Form + Zod

Alasan:
- App Router dan nested layout cocok untuk banyak dashboard dengan akses berbeda.
- Rendering hybrid cocok untuk dashboard guru dan orang tua yang butuh cepat dibuka di mobile.
- TanStack Query mempermudah sinkronisasi data absensi, izin BK, dan dispensasi antar dashboard.
- Tailwind CSS cocok untuk UI flat, minimalis, dan responsif dengan iterasi cepat.

### Backend
- NestJS + TypeScript
- Prisma ORM
- Swagger / OpenAPI
- Redis opsional untuk queue dan cache

Alasan:
- NestJS modular dan aman untuk domain yang besar: auth, master data, absensi, izin, dispensasi, audit log, dan integrasi IoT.
- Prisma mempercepat akses database, migration, dan menjaga type-safety.
- Swagger penting agar integrasi frontend, mobile web, dan perangkat IoT di masa depan tetap konsisten.
- Redis belum wajib di versi awal, tetapi bagus untuk cache dashboard dan job sinkronisasi status massal.

### Database
- PostgreSQL

Alasan:
- Cocok untuk model relasional kuat: batch, kelas, siswa, jadwal, periodisasi pelajaran, dan audit.
- Mendukung foreign key, transaksi, dan indexing yang penting untuk akurasi absensi per jam.
- Paling aman untuk kebutuhan histori dan pelacakan perubahan status.

### Deployment
- Monorepo `pnpm workspace`
- Docker Compose untuk lingkungan sekolah / VPS
- Nginx sebagai reverse proxy

Alasan:
- Frontend dan backend bisa berbagi DTO, enum, dan validation contract.
- Docker memudahkan deploy ulang oleh tim kecil sekolah.

## 2. Desain Data dan ERD

### Prinsip data
- `batches -> classes -> student_class_enrollments -> students`
- Siswa tidak disimpan langsung ke satu kelas permanen. Riwayat kelas dipisah di `student_class_enrollments` agar kenaikan kelas aman.
- Otorisasi akses tidak disimpan sebagai satu role tunggal di tabel user, tetapi memakai `roles` dan `user_roles`.
- Penugasan staf operasional tidak disimpan sebagai satu jenis staf tunggal, tetapi memakai `staff_positions` dan `staff_position_assignments`.
- Status kehadiran final per jam disimpan di `attendance_period_statuses`.
- Semua perubahan status dicatat di `attendance_audit_logs`.
- Izin BK dan sakit BK memakai rentang `start_period_no` sampai `end_period_no` dengan jenis status yang eksplisit.
- Dispensasi Kesiswaan juga memakai rentang `start_period_no` sampai `end_period_no`.
- Hari sekolah dan perubahan jam khusus disimpan di `school_calendar_days` dan `daily_lesson_period_overrides`.
- Placeholder tap-in/tap-out disimpan di `tap_events`.

### Status yang dipakai
- `HADIR`: hadir di kelas saat jam tersebut. Label UI bisa ditampilkan sebagai `Masuk`.
- `ALFA`: tidak hadir dan belum pernah terdeteksi hadir di hari itu.
- `IZIN`: izin aktif dari BK.
- `SAKIT`: sakit yang ditetapkan oleh BK.
- `DISPENSASI`: dispensasi aktif dari Kesiswaan.
- `BOLOS`: tidak hadir tanpa izin aktif setelah sebelumnya sudah hadir atau seharusnya kembali.

### Relasi inti
- Satu `batch` punya banyak `classes` dan `students`.
- Satu `class` punya banyak `student_class_enrollments` dan `class_schedules`.
- Satu `student` punya banyak `attendance_period_statuses`, `bk_leave_permissions`, `dispensation_students`, dan `tap_events`.
- Satu `user` bisa punya banyak `roles`.
- Satu `staff` bisa punya banyak `staff_positions`.
- Satu `dispensation` bisa berlaku untuk banyak siswa.
- Satu `attendance_period_status` bisa memiliki referensi ke izin BK atau dispensasi yang menyebabkan status itu aktif.
- `student_class_enrollments` divalidasi agar batch siswa selalu sama dengan batch kelas.

### File schema
- Lihat SQL lengkap di `backend/database/schema.sql`.

## 3. Arsitektur Backend

### Struktur folder yang disarankan

```text
apps/
  web/
  api/
packages/
  shared/
    enums/
    dto/
    utils/
```

```text
backend/
  database/
    schema.sql
  src/
    main.ts
    app.module.ts
    common/
      decorators/
      guards/
      interceptors/
      filters/
      pipes/
      constants/
    config/
    database/
      prisma.service.ts
    modules/
      auth/
      roles/
      users/
      staffs/
      parents/
      batches/
      academic-years/
      calendar/
      classes/
      students/
      enrollments/
      subjects/
      lesson-periods/
      schedules/
      attendance/
        dto/
        controllers/
        services/
        repositories/
      bk-permissions/
      dispensations/
      tap-gateway/
      reports/
```

### Modul backend yang wajib ada
- `auth`: login, refresh token, guard role-based access.
- `master-data`: batch, tahun ajaran, kelas, siswa, guru/staf, orang tua.
- `calendar`: hari sekolah, libur, ujian, dan override jam pelajaran.
- `schedule`: map kelas, mapel, guru, dan jam pelajaran.
- `attendance`: base check jam pertama, cross-check, histori, sinkronisasi status.
- `bk-permissions`: surat BK untuk set status `IZIN` atau `SAKIT` berbasis rentang jam.
- `dispensations`: dispensasi resmi dari Kesiswaan.
- `tap-gateway`: endpoint placeholder untuk perangkat scanner.
- `reports`: rekap harian, mingguan, bulanan, dan histori orang tua.

## 4. API RESTful yang Disarankan

### Auth
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Master data
- `GET|POST /api/v1/batches`
- `GET|PATCH|DELETE /api/v1/batches/:id`
- `GET|POST /api/v1/academic-years`
- `GET|PATCH|DELETE /api/v1/academic-years/:id`
- `GET /api/v1/roles`
- `PUT /api/v1/users/:id/roles`
- `GET|POST /api/v1/classes`
- `GET|PATCH|DELETE /api/v1/classes/:id`
- `GET|POST /api/v1/students`
- `GET|PATCH|DELETE /api/v1/students/:id`
- `POST /api/v1/students/:id/enrollments`
- `PATCH /api/v1/enrollments/:id`
- `GET|POST /api/v1/staffs`
- `GET|PATCH|DELETE /api/v1/staffs/:id`
- `PUT /api/v1/staffs/:id/positions`
- `GET|POST /api/v1/parents`
- `GET|PATCH|DELETE /api/v1/parents/:id`
- `POST /api/v1/parents/:id/students/:studentId/link`
- `GET|POST /api/v1/subjects`
- `GET|PATCH|DELETE /api/v1/subjects/:id`
- `GET|POST /api/v1/lesson-periods`
- `GET|PATCH|DELETE /api/v1/lesson-periods/:periodNo`
- `GET|POST /api/v1/schedules`
- `GET|PATCH|DELETE /api/v1/schedules/:id`

### Kalender akademik operasional
- `GET|POST /api/v1/calendar-days`
- `GET|PATCH|DELETE /api/v1/calendar-days/:date`
- `GET|POST /api/v1/daily-period-overrides`
- `GET|PATCH|DELETE /api/v1/daily-period-overrides/:id`

### Absensi
- `POST /api/v1/attendance/base-check`
  - Input jam 1.
  - Payload hanya berisi status awal fisik: `HADIR | ALFA`.
  - Jika pada jam yang sama sudah ada status BK / dispensasi aktif, sistem melakukan overlay status resmi setelah base check tersimpan.
- `POST /api/v1/attendance/cross-check`
  - Input guru mapel saat pergantian jam.
  - Payload berisi `studentId`, `teacherObservation`, `lessonPeriodNo`, `scheduleId`.
- `GET /api/v1/attendance/classes/:classId/current`
  - Status real-time satu kelas pada jam tertentu.
- `GET /api/v1/attendance/classes/:classId/daily`
  - Status semua siswa untuk satu hari.
- `GET /api/v1/attendance/students/:studentId/history`
  - Histori absensi untuk siswa.
- `GET /api/v1/attendance/students/:studentId/today`
  - Timeline status hari ini.

### Dashboard BK
- `GET /api/v1/bk-dashboard/classes/:classId/students?date=YYYY-MM-DD&periodNo=5`
- `POST /api/v1/bk-dashboard/status-overrides`
  - Dipakai BK untuk menetapkan status `IZIN` atau `SAKIT` pada siswa.
  - Payload inti: `studentId`, `classId`, `attendanceDate`, `startPeriodNo`, `endPeriodNo`, `status`, `reason`, `letterNumber`, `returnRequired`, `expectedReturnPeriodNo`.
- `PATCH /api/v1/bk-dashboard/status-overrides/:id/cancel`

### Izin / Sakit BK
- `POST /api/v1/bk-permissions`
- `GET /api/v1/bk-permissions`
- `GET /api/v1/bk-permissions/:id`
- `PATCH /api/v1/bk-permissions/:id/cancel`

Payload inti:
- `permissionKind`: `IZIN | SAKIT`
- `startPeriodNo`
- `endPeriodNo`
- `returnRequired`
- `expectedReturnPeriodNo`
- `reason`

Efek bisnis:
- Saat entri BK dibuat dengan `permissionKind=IZIN`, sistem me-mark period yang tercakup menjadi `IZIN`.
- Saat entri BK dibuat dengan `permissionKind=SAKIT`, sistem me-mark period yang tercakup menjadi `SAKIT`.
- Jika `returnRequired=true`, siswa wajib kembali mulai `expectedReturnPeriodNo`.
- Saat entri BK dibatalkan, period terkait dihitung ulang.

### Dispensasi Kesiswaan
- `POST /api/v1/dispensations`
- `POST /api/v1/dispensations/:id/students`
- `PATCH /api/v1/dispensations/:id/publish`
- `PATCH /api/v1/dispensations/:id/cancel`
- `GET /api/v1/dispensations`
- `GET /api/v1/dispensations/:id`

Efek bisnis:
- Hanya role `KESISWAAN` yang boleh `publish`.
- Saat `publish`, period terkait otomatis menjadi `DISPENSASI`.
- Dispensasi yang mewajibkan siswa kembali ke kelas juga menyimpan `returnRequired` dan `expectedReturnPeriodNo`.

### Dashboard guru mapel
- `GET /api/v1/teacher/me/schedules?date=YYYY-MM-DD`
- `GET /api/v1/teacher/me/classes/:classId/periods/:periodNo`
- `POST /api/v1/teacher/me/classes/:classId/periods/:periodNo/verify`

### Dashboard orang tua
- `GET /api/v1/parent/me/students`
- `GET /api/v1/parent/me/students/:studentId/today`
- `GET /api/v1/parent/me/students/:studentId/history`

### Placeholder IoT tap-in / tap-out
- `POST /api/v1/tap-events/tap-in`
- `POST /api/v1/tap-events/tap-out`
- `POST /api/v1/tap-events/raw`
- `GET /api/v1/tap-events`

Contoh payload minimal:

```json
{
  "nis": "202400123",
  "deviceCode": "GATE-01",
  "externalEventId": "evt-20260420-00001",
  "deviceSequence": 100231,
  "timestamp": "2026-04-20T06:55:03+07:00",
  "rawPayload": {
    "scannerId": "GATE-01",
    "signal": "RFID"
  }
}
```

## 5. Aturan Logika Bisnis Inti

### Base check jam pertama
- Dilakukan oleh Guru Mapel jam pertama atau Admin/TU.
- Membentuk baseline hari itu.
- Satu siswa hanya punya satu status final per jam.
- Base check tidak boleh langsung menetapkan `IZIN`, `SAKIT`, atau `DISPENSASI`.
- Status resmi non-fisik hanya boleh berasal dari record BK atau Kesiswaan yang aktif.

### Izin BK / Sakit BK / Dispensasi
- Berlaku hanya pada rentang jam yang diinput.
- Tidak mengubah jam di luar rentang.
- Dashboard BK menjadi otoritas untuk menetapkan `IZIN` dan `SAKIT`.
- Selama status aktif, dashboard guru mapel pada jam terkait harus membaca status BK atau dispensasi tersebut sebagai status final.
- Sistem harus menolak entri BK aktif yang overlap pada siswa, tanggal, dan jam yang sama, termasuk overlap dengan dispensasi terbit.
- Sistem harus menolak dispensasi terbit yang overlap pada siswa, tanggal, dan jam yang sama, termasuk overlap dengan status BK aktif.
- Jika status tersebut mewajibkan siswa kembali ke kelas, sistem menyimpan kewajiban kembali secara eksplisit.

### Cross-check pergantian mapel
- Dipakai mulai jam ke-2.
- Prioritas penentuan status:
  1. Dispensasi aktif.
  2. Sakit BK aktif.
  3. Izin BK aktif.
  4. Kewajiban kembali yang sudah jatuh tempo.
  5. Observasi guru mapel saat ini.
  6. Riwayat hadir sebelumnya pada hari yang sama.
- Jika status resmi sudah berakhir dan siswa seharusnya kembali tetapi tetap tidak ada, status menjadi `BOLOS`.
- Jika siswa sekarang tidak ada, tidak punya status BK aktif atau dispensasi aktif, dan pernah hadir sebelumnya pada hari itu, status menjadi `BOLOS`.
- Jika siswa sekarang tidak ada, tidak punya status BK aktif atau dispensasi aktif, dan belum pernah hadir di hari itu, status tetap `ALFA`.

## 6. Boilerplate Cross-Check

File contoh:
- `backend/src/modules/attendance/services/attendance-crosscheck.service.ts`

Fungsi inti yang disiapkan:
- membaca status period sebelumnya,
- mengecek apakah siswa pernah hadir sebelumnya di hari yang sama,
- mengecek status BK aktif (`IZIN` atau `SAKIT`) / dispensasi aktif,
- mengecek apakah ada kewajiban kembali ke kelas yang sudah jatuh tempo,
- menentukan status final,
- menyimpan hasil sebagai baseline baru,
- menulis audit log.

## 7. Catatan Implementasi Penting

- Jangan simpan status absensi hanya dalam bentuk summary harian. Simpan per jam agar izin dan bolos bisa dilacak akurat.
- Gunakan transaksi database untuk setiap operasi cross-check, publish dispensasi, dan input status BK.
- Gunakan `student_class_enrollments` sebagai sumber kebenaran riwayat kelas, bukan `students.class_id`.
- Gunakan `user_roles` untuk otorisasi aplikasi dan `staff_position_assignments` untuk penugasan operasional.
- Gunakan `school_calendar_days` dan `daily_lesson_period_overrides` agar libur, ujian, dan jadwal khusus tidak memaksa perubahan ke `lesson_periods` default.
- Orang tua cukup `view-only`, jadi endpoint parent harus dibatasi pada siswa yang terhubung di `parent_student_links`.
- Simpan `externalEventId` atau `deviceSequence` pada tap event agar integrasi IoT bersifat idempotent.
- Placeholder tap event sebaiknya hanya menyimpan data mentah dulu. Integrasi otomatis ke absensi bisa diaktifkan belakangan setelah aturan gerbang sekolah final.
