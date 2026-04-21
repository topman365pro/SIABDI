CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE role_code AS ENUM (
  'ADMIN_TU',
  'KESISWAAN',
  'BK',
  'GURU_MAPEL',
  'ORANG_TUA'
);

CREATE TYPE staff_position_code AS ENUM (
  'GURU_MAPEL',
  'BK',
  'TU',
  'KESISWAAN',
  'WALI_KELAS'
);

CREATE TYPE gender_type AS ENUM (
  'L',
  'P'
);

CREATE TYPE weekday_enum AS ENUM (
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY'
);

CREATE TYPE attendance_status AS ENUM (
  'HADIR',
  'ALFA',
  'IZIN',
  'SAKIT',
  'DISPENSASI',
  'BOLOS'
);

CREATE TYPE attendance_source AS ENUM (
  'BASE_CHECK',
  'CROSS_CHECK',
  'BK_PERMISSION',
  'DISPENSATION',
  'SYSTEM_DERIVED',
  'TAP_IN',
  'TAP_OUT',
  'MANUAL_ADMIN'
);

CREATE TYPE permission_state AS ENUM (
  'ACTIVE',
  'CANCELLED'
);

CREATE TYPE bk_permission_kind AS ENUM (
  'IZIN',
  'SAKIT'
);

CREATE TYPE dispensation_state AS ENUM (
  'DRAFT',
  'PUBLISHED',
  'CANCELLED'
);

CREATE TYPE calendar_day_type AS ENUM (
  'SCHOOL_DAY',
  'HOLIDAY',
  'EXAM_DAY',
  'SPECIAL_SCHEDULE'
);

CREATE TYPE tap_type AS ENUM (
  'IN',
  'OUT'
);

CREATE TYPE tap_device_type AS ENUM (
  'RFID',
  'BARCODE',
  'QR',
  'NFC'
);

CREATE TYPE tap_processing_status AS ENUM (
  'RECEIVED',
  'MATCHED',
  'REJECTED',
  'PROCESSED'
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roles (
  code role_code PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_code role_code NOT NULL REFERENCES roles(code) ON DELETE RESTRICT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role_code)
);

CREATE INDEX idx_user_roles_role_code
  ON user_roles(role_code);

CREATE TABLE staffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  full_name VARCHAR(150) NOT NULL,
  employee_number VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE staff_positions (
  code staff_position_code PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE staff_position_assignments (
  staff_id UUID NOT NULL REFERENCES staffs(id) ON DELETE CASCADE,
  position_code staff_position_code NOT NULL REFERENCES staff_positions(code) ON DELETE RESTRICT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (staff_id, position_code)
);

CREATE INDEX idx_staff_position_assignments_position_code
  ON staff_position_assignments(position_code);

CREATE UNIQUE INDEX uq_staff_primary_position
  ON staff_position_assignments(staff_id)
  WHERE is_primary = TRUE;

CREATE TABLE parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(150),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO roles (code, name, description) VALUES
  ('ADMIN_TU', 'Admin / TU', 'Akses penuh untuk master data dan operasional administrasi.'),
  ('KESISWAAN', 'Kesiswaan', 'Otoritas tunggal untuk publikasi dispensasi.'),
  ('BK', 'Bimbingan Konseling', 'Otoritas untuk status izin dan sakit.'),
  ('GURU_MAPEL', 'Guru Mata Pelajaran', 'Verifikasi kehadiran per jam pelajaran.'),
  ('ORANG_TUA', 'Orang Tua', 'Akses baca histori dan status kehadiran siswa.')
ON CONFLICT (code) DO NOTHING;

INSERT INTO staff_positions (code, name, description) VALUES
  ('GURU_MAPEL', 'Guru Mapel', 'Pengampu mata pelajaran pada jadwal kelas.'),
  ('BK', 'Guru BK', 'Petugas BK yang berwenang mengelola izin dan sakit.'),
  ('TU', 'Tata Usaha', 'Petugas administrasi sekolah.'),
  ('KESISWAAN', 'Kesiswaan', 'Petugas kesiswaan untuk dispensasi dan tata tertib.'),
  ('WALI_KELAS', 'Wali Kelas', 'Wali kelas pada tahun ajaran tertentu.')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  entry_year INTEGER NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(20) NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_academic_year_range CHECK (end_date >= start_date)
);

CREATE UNIQUE INDEX uq_academic_year_active
  ON academic_years(is_active)
  WHERE is_active = TRUE;

CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE RESTRICT,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
  name VARCHAR(100) NOT NULL,
  grade_level SMALLINT NOT NULL,
  major VARCHAR(50),
  parallel_code VARCHAR(10),
  homeroom_staff_id UUID REFERENCES staffs(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_class_name_per_year UNIQUE (academic_year_id, name),
  CONSTRAINT chk_grade_level CHECK (grade_level BETWEEN 1 AND 12)
);

CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE RESTRICT,
  nis VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  gender gender_type,
  birth_date DATE,
  barcode_value VARCHAR(100) UNIQUE,
  rfid_uid VARCHAR(100) UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_student_class_period UNIQUE (student_id, class_id, start_date),
  CONSTRAINT chk_enrollment_range CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE UNIQUE INDEX uq_student_active_enrollment
  ON student_class_enrollments(student_id)
  WHERE is_active = TRUE;

CREATE TABLE parent_student_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  relationship VARCHAR(30) NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_parent_student UNIQUE (parent_id, student_id)
);

CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lesson_periods (
  period_no SMALLINT PRIMARY KEY,
  label VARCHAR(30) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT chk_period_no CHECK (period_no BETWEEN 1 AND 20),
  CONSTRAINT chk_period_time CHECK (end_time > start_time)
);

CREATE TABLE school_calendar_days (
  calendar_date DATE PRIMARY KEY,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
  day_type calendar_day_type NOT NULL DEFAULT 'SCHOOL_DAY',
  title VARCHAR(150) NOT NULL,
  description TEXT,
  is_school_day BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE daily_lesson_period_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_date DATE NOT NULL REFERENCES school_calendar_days(calendar_date) ON DELETE CASCADE,
  lesson_period_no SMALLINT NOT NULL REFERENCES lesson_periods(period_no) ON DELETE RESTRICT,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  label VARCHAR(30) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_daily_period_override_time CHECK (end_time > start_time)
);

CREATE UNIQUE INDEX uq_daily_period_override_global
  ON daily_lesson_period_overrides(calendar_date, lesson_period_no)
  WHERE class_id IS NULL;

CREATE UNIQUE INDEX uq_daily_period_override_per_class
  ON daily_lesson_period_overrides(calendar_date, lesson_period_no, class_id)
  WHERE class_id IS NOT NULL;

CREATE TABLE class_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  teacher_staff_id UUID NOT NULL REFERENCES staffs(id) ON DELETE RESTRICT,
  weekday weekday_enum NOT NULL,
  lesson_period_no SMALLINT NOT NULL REFERENCES lesson_periods(period_no) ON DELETE RESTRICT,
  room_name VARCHAR(50),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_class_schedule UNIQUE (class_id, weekday, lesson_period_no),
  CONSTRAINT uq_teacher_schedule UNIQUE (teacher_staff_id, academic_year_id, weekday, lesson_period_no)
);

CREATE TABLE bk_leave_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
  attendance_date DATE NOT NULL,
  permission_kind bk_permission_kind NOT NULL,
  start_period_no SMALLINT NOT NULL REFERENCES lesson_periods(period_no) ON DELETE RESTRICT,
  end_period_no SMALLINT NOT NULL REFERENCES lesson_periods(period_no) ON DELETE RESTRICT,
  return_required BOOLEAN NOT NULL DEFAULT FALSE,
  expected_return_period_no SMALLINT REFERENCES lesson_periods(period_no) ON DELETE RESTRICT,
  reason TEXT NOT NULL,
  letter_number VARCHAR(50),
  status permission_state NOT NULL DEFAULT 'ACTIVE',
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by_staff_id UUID NOT NULL REFERENCES staffs(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_bk_period_range CHECK (start_period_no <= end_period_no),
  CONSTRAINT chk_bk_return_rule CHECK (
    (return_required = FALSE AND expected_return_period_no IS NULL)
    OR
    (return_required = TRUE AND expected_return_period_no IS NOT NULL AND expected_return_period_no > end_period_no)
  )
);

CREATE INDEX idx_bk_permission_lookup
  ON bk_leave_permissions(student_id, attendance_date, start_period_no, end_period_no, status);

CREATE TABLE dispensations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(150) NOT NULL,
  description TEXT,
  attendance_date DATE NOT NULL,
  start_period_no SMALLINT NOT NULL REFERENCES lesson_periods(period_no) ON DELETE RESTRICT,
  end_period_no SMALLINT NOT NULL REFERENCES lesson_periods(period_no) ON DELETE RESTRICT,
  return_required BOOLEAN NOT NULL DEFAULT FALSE,
  expected_return_period_no SMALLINT REFERENCES lesson_periods(period_no) ON DELETE RESTRICT,
  letter_number VARCHAR(50),
  status dispensation_state NOT NULL DEFAULT 'DRAFT',
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by_staff_id UUID REFERENCES staffs(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_dispensation_period_range CHECK (start_period_no <= end_period_no),
  CONSTRAINT chk_dispensation_return_rule CHECK (
    (return_required = FALSE AND expected_return_period_no IS NULL)
    OR
    (return_required = TRUE AND expected_return_period_no IS NOT NULL AND expected_return_period_no > end_period_no)
  )
);

CREATE TABLE dispensation_students (
  dispensation_id UUID NOT NULL REFERENCES dispensations(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
  PRIMARY KEY (dispensation_id, student_id)
);

CREATE INDEX idx_dispensation_student_lookup
  ON dispensation_students(student_id, class_id);

CREATE TABLE attendance_period_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_date DATE NOT NULL,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
  lesson_period_no SMALLINT NOT NULL REFERENCES lesson_periods(period_no) ON DELETE RESTRICT,
  schedule_id UUID REFERENCES class_schedules(id) ON DELETE SET NULL,
  status attendance_status NOT NULL,
  source attendance_source NOT NULL,
  note TEXT,
  marked_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  previous_attendance_status_id UUID REFERENCES attendance_period_statuses(id) ON DELETE SET NULL,
  bk_permission_id UUID REFERENCES bk_leave_permissions(id) ON DELETE SET NULL,
  dispensation_id UUID REFERENCES dispensations(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_attendance_per_period UNIQUE (attendance_date, student_id, lesson_period_no)
);

CREATE INDEX idx_attendance_student_daily
  ON attendance_period_statuses(student_id, attendance_date, lesson_period_no);

CREATE INDEX idx_attendance_class_daily
  ON attendance_period_statuses(class_id, attendance_date, lesson_period_no);

CREATE TABLE attendance_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_period_status_id UUID NOT NULL REFERENCES attendance_period_statuses(id) ON DELETE CASCADE,
  previous_status attendance_status,
  new_status attendance_status NOT NULL,
  change_source attendance_source NOT NULL,
  changed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tap_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_code VARCHAR(50) NOT NULL UNIQUE,
  device_name VARCHAR(100) NOT NULL,
  device_type tap_device_type NOT NULL,
  location_description VARCHAR(150),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tap_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  nis_input VARCHAR(50) NOT NULL,
  tap_type tap_type NOT NULL,
  tapped_at TIMESTAMPTZ NOT NULL,
  device_id UUID REFERENCES tap_devices(id) ON DELETE SET NULL,
  external_event_id VARCHAR(100),
  device_sequence BIGINT,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  processing_status tap_processing_status NOT NULL DEFAULT 'RECEIVED',
  linked_attendance_status_id UUID REFERENCES attendance_period_statuses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tap_events_student_time
  ON tap_events(student_id, tapped_at);

CREATE INDEX idx_tap_events_nis_time
  ON tap_events(nis_input, tapped_at);

CREATE UNIQUE INDEX uq_tap_events_external_id
  ON tap_events(external_event_id)
  WHERE external_event_id IS NOT NULL;

CREATE UNIQUE INDEX uq_tap_events_device_sequence
  ON tap_events(device_id, device_sequence)
  WHERE device_id IS NOT NULL AND device_sequence IS NOT NULL;

CREATE OR REPLACE FUNCTION validate_student_enrollment_batch()
RETURNS TRIGGER AS $$
DECLARE
  v_student_batch_id UUID;
  v_class_batch_id UUID;
BEGIN
  SELECT batch_id INTO v_student_batch_id
  FROM students
  WHERE id = NEW.student_id;

  SELECT batch_id INTO v_class_batch_id
  FROM classes
  WHERE id = NEW.class_id;

  IF v_student_batch_id IS DISTINCT FROM v_class_batch_id THEN
    RAISE EXCEPTION 'Student batch and class batch must match for enrollment.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_student_enrollment_batch
BEFORE INSERT OR UPDATE
ON student_class_enrollments
FOR EACH ROW
EXECUTE FUNCTION validate_student_enrollment_batch();

CREATE OR REPLACE FUNCTION validate_bk_permission_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status <> 'ACTIVE' THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM bk_leave_permissions existing
    WHERE existing.student_id = NEW.student_id
      AND existing.attendance_date = NEW.attendance_date
      AND existing.status = 'ACTIVE'
      AND existing.id <> NEW.id
      AND int4range(existing.start_period_no, existing.end_period_no + 1, '[)')
        && int4range(NEW.start_period_no, NEW.end_period_no + 1, '[)')
  ) THEN
    RAISE EXCEPTION 'Active BK permission cannot overlap for the same student and date.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM dispensation_students assigned_students
    JOIN dispensations published_dispensations
      ON published_dispensations.id = assigned_students.dispensation_id
    WHERE assigned_students.student_id = NEW.student_id
      AND published_dispensations.status = 'PUBLISHED'
      AND published_dispensations.attendance_date = NEW.attendance_date
      AND int4range(published_dispensations.start_period_no, published_dispensations.end_period_no + 1, '[)')
        && int4range(NEW.start_period_no, NEW.end_period_no + 1, '[)')
  ) THEN
    RAISE EXCEPTION 'Active BK permission cannot overlap with a published dispensation.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_bk_permission_overlap
BEFORE INSERT OR UPDATE
ON bk_leave_permissions
FOR EACH ROW
EXECUTE FUNCTION validate_bk_permission_overlap();

CREATE OR REPLACE FUNCTION validate_published_dispensation_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status <> 'PUBLISHED' THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM dispensation_students current_students
    JOIN dispensation_students other_students
      ON other_students.student_id = current_students.student_id
    JOIN dispensations other_dispensations
      ON other_dispensations.id = other_students.dispensation_id
    WHERE current_students.dispensation_id = NEW.id
      AND other_dispensations.status = 'PUBLISHED'
      AND other_dispensations.id <> NEW.id
      AND other_dispensations.attendance_date = NEW.attendance_date
      AND int4range(other_dispensations.start_period_no, other_dispensations.end_period_no + 1, '[)')
        && int4range(NEW.start_period_no, NEW.end_period_no + 1, '[)')
  ) THEN
    RAISE EXCEPTION 'Published dispensation cannot overlap for the same student and date.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM dispensation_students current_students
    JOIN bk_leave_permissions active_permissions
      ON active_permissions.student_id = current_students.student_id
    WHERE current_students.dispensation_id = NEW.id
      AND active_permissions.status = 'ACTIVE'
      AND active_permissions.attendance_date = NEW.attendance_date
      AND int4range(active_permissions.start_period_no, active_permissions.end_period_no + 1, '[)')
        && int4range(NEW.start_period_no, NEW.end_period_no + 1, '[)')
  ) THEN
    RAISE EXCEPTION 'Published dispensation cannot overlap with an active BK permission.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_published_dispensation_overlap
BEFORE INSERT OR UPDATE
ON dispensations
FOR EACH ROW
EXECUTE FUNCTION validate_published_dispensation_overlap();

CREATE OR REPLACE FUNCTION validate_published_dispensation_student_overlap()
RETURNS TRIGGER AS $$
DECLARE
  v_dispensation dispensations%ROWTYPE;
BEGIN
  SELECT *
  INTO v_dispensation
  FROM dispensations
  WHERE id = NEW.dispensation_id;

  IF v_dispensation.status <> 'PUBLISHED' THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM dispensation_students other_students
    JOIN dispensations other_dispensations
      ON other_dispensations.id = other_students.dispensation_id
    WHERE other_students.student_id = NEW.student_id
      AND other_dispensations.status = 'PUBLISHED'
      AND other_dispensations.id <> NEW.dispensation_id
      AND other_dispensations.attendance_date = v_dispensation.attendance_date
      AND int4range(other_dispensations.start_period_no, other_dispensations.end_period_no + 1, '[)')
        && int4range(v_dispensation.start_period_no, v_dispensation.end_period_no + 1, '[)')
  ) THEN
    RAISE EXCEPTION 'Student already has another published dispensation in the same period range.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM bk_leave_permissions active_permissions
    WHERE active_permissions.student_id = NEW.student_id
      AND active_permissions.status = 'ACTIVE'
      AND active_permissions.attendance_date = v_dispensation.attendance_date
      AND int4range(active_permissions.start_period_no, active_permissions.end_period_no + 1, '[)')
        && int4range(v_dispensation.start_period_no, v_dispensation.end_period_no + 1, '[)')
  ) THEN
    RAISE EXCEPTION 'Student already has an active BK permission in the same period range.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_published_dispensation_student_overlap
BEFORE INSERT OR UPDATE
ON dispensation_students
FOR EACH ROW
EXECUTE FUNCTION validate_published_dispensation_student_overlap();
