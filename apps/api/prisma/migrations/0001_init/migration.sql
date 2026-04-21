-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "RoleCode" AS ENUM ('ADMIN_TU', 'KESISWAAN', 'BK', 'GURU_MAPEL', 'ORANG_TUA');

-- CreateEnum
CREATE TYPE "StaffPositionCode" AS ENUM ('GURU_MAPEL', 'BK', 'TU', 'KESISWAAN', 'WALI_KELAS');

-- CreateEnum
CREATE TYPE "GenderType" AS ENUM ('L', 'P');

-- CreateEnum
CREATE TYPE "WeekdayEnum" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('HADIR', 'ALFA', 'IZIN', 'SAKIT', 'DISPENSASI', 'BOLOS');

-- CreateEnum
CREATE TYPE "AttendanceSource" AS ENUM ('BASE_CHECK', 'CROSS_CHECK', 'BK_PERMISSION', 'DISPENSATION', 'SYSTEM_DERIVED', 'TAP_IN', 'TAP_OUT', 'MANUAL_ADMIN');

-- CreateEnum
CREATE TYPE "PermissionState" AS ENUM ('ACTIVE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BkPermissionKind" AS ENUM ('IZIN', 'SAKIT');

-- CreateEnum
CREATE TYPE "DispensationState" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CalendarDayType" AS ENUM ('SCHOOL_DAY', 'HOLIDAY', 'EXAM_DAY', 'SPECIAL_SCHEDULE');

-- CreateEnum
CREATE TYPE "TapType" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "TapDeviceType" AS ENUM ('RFID', 'BARCODE', 'QR', 'NFC');

-- CreateEnum
CREATE TYPE "TapProcessingStatus" AS ENUM ('RECEIVED', 'MATCHED', 'REJECTED', 'PROCESSED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "refresh_token_hash" TEXT,
    "full_name" VARCHAR(150) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "code" "RoleCode" NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" UUID NOT NULL,
    "role_code" "RoleCode" NOT NULL,
    "assigned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_code")
);

-- CreateTable
CREATE TABLE "staffs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "full_name" VARCHAR(150) NOT NULL,
    "employee_number" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "staffs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_positions" (
    "code" "StaffPositionCode" NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_positions_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "staff_position_assignments" (
    "staff_id" UUID NOT NULL,
    "position_code" "StaffPositionCode" NOT NULL,
    "assigned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "staff_position_assignments_pkey" PRIMARY KEY ("staff_id","position_code")
);

-- CreateTable
CREATE TABLE "parents" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "full_name" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(30),
    "email" VARCHAR(150),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "parents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batches" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "entry_year" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_years" (
    "id" UUID NOT NULL,
    "name" VARCHAR(20) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "grade_level" INTEGER NOT NULL,
    "major" VARCHAR(50),
    "parallel_code" VARCHAR(10),
    "homeroom_staff_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "nis" VARCHAR(50) NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "gender" "GenderType",
    "birth_date" DATE,
    "barcode_value" VARCHAR(100),
    "rfid_uid" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_class_enrollments" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "student_class_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parent_student_links" (
    "id" UUID NOT NULL,
    "parent_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "relationship" VARCHAR(30) NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parent_student_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_periods" (
    "period_no" INTEGER NOT NULL,
    "label" VARCHAR(30) NOT NULL,
    "start_time" TIME(0) NOT NULL,
    "end_time" TIME(0) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "lesson_periods_pkey" PRIMARY KEY ("period_no")
);

-- CreateTable
CREATE TABLE "school_calendar_days" (
    "calendar_date" DATE NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "day_type" "CalendarDayType" NOT NULL DEFAULT 'SCHOOL_DAY',
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "is_school_day" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "school_calendar_days_pkey" PRIMARY KEY ("calendar_date")
);

-- CreateTable
CREATE TABLE "daily_lesson_period_overrides" (
    "id" UUID NOT NULL,
    "calendar_date" DATE NOT NULL,
    "lesson_period_no" INTEGER NOT NULL,
    "class_id" UUID,
    "label" VARCHAR(30) NOT NULL,
    "start_time" TIME(0) NOT NULL,
    "end_time" TIME(0) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "daily_lesson_period_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_schedules" (
    "id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "teacher_staff_id" UUID NOT NULL,
    "weekday" "WeekdayEnum" NOT NULL,
    "lesson_period_no" INTEGER NOT NULL,
    "room_name" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "class_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bk_leave_permissions" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "attendance_date" DATE NOT NULL,
    "permission_kind" "BkPermissionKind" NOT NULL,
    "start_period_no" INTEGER NOT NULL,
    "end_period_no" INTEGER NOT NULL,
    "return_required" BOOLEAN NOT NULL DEFAULT false,
    "expected_return_period_no" INTEGER,
    "reason" TEXT NOT NULL,
    "letter_number" VARCHAR(50),
    "status" "PermissionState" NOT NULL DEFAULT 'ACTIVE',
    "created_by_user_id" UUID,
    "approved_by_staff_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "bk_leave_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispensations" (
    "id" UUID NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "attendance_date" DATE NOT NULL,
    "start_period_no" INTEGER NOT NULL,
    "end_period_no" INTEGER NOT NULL,
    "return_required" BOOLEAN NOT NULL DEFAULT false,
    "expected_return_period_no" INTEGER,
    "letter_number" VARCHAR(50),
    "status" "DispensationState" NOT NULL DEFAULT 'DRAFT',
    "created_by_user_id" UUID,
    "approved_by_staff_id" UUID,
    "published_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "dispensations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispensation_students" (
    "dispensation_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,

    CONSTRAINT "dispensation_students_pkey" PRIMARY KEY ("dispensation_id","student_id")
);

-- CreateTable
CREATE TABLE "attendance_period_statuses" (
    "id" UUID NOT NULL,
    "attendance_date" DATE NOT NULL,
    "student_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "lesson_period_no" INTEGER NOT NULL,
    "schedule_id" UUID,
    "status" "AttendanceStatus" NOT NULL,
    "source" "AttendanceSource" NOT NULL,
    "note" TEXT,
    "marked_by_user_id" UUID,
    "previous_attendance_status_id" UUID,
    "bk_permission_id" UUID,
    "dispensation_id" UUID,
    "verified_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "attendance_period_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_audit_logs" (
    "id" UUID NOT NULL,
    "attendance_period_status_id" UUID NOT NULL,
    "previous_status" "AttendanceStatus",
    "new_status" "AttendanceStatus" NOT NULL,
    "change_source" "AttendanceSource" NOT NULL,
    "changed_by_user_id" UUID,
    "reason" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tap_devices" (
    "id" UUID NOT NULL,
    "device_code" VARCHAR(50) NOT NULL,
    "device_name" VARCHAR(100) NOT NULL,
    "device_type" "TapDeviceType" NOT NULL,
    "location_description" VARCHAR(150),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "tap_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tap_events" (
    "id" UUID NOT NULL,
    "student_id" UUID,
    "nis_input" VARCHAR(50) NOT NULL,
    "tap_type" "TapType" NOT NULL,
    "tapped_at" TIMESTAMPTZ NOT NULL,
    "device_id" UUID,
    "external_event_id" VARCHAR(100),
    "device_sequence" BIGINT,
    "raw_payload" JSONB NOT NULL DEFAULT '{}',
    "processing_status" "TapProcessingStatus" NOT NULL DEFAULT 'RECEIVED',
    "linked_attendance_status_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tap_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE INDEX "user_roles_role_code_idx" ON "user_roles"("role_code");

-- CreateIndex
CREATE UNIQUE INDEX "staffs_user_id_key" ON "staffs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "staffs_employee_number_key" ON "staffs"("employee_number");

-- CreateIndex
CREATE UNIQUE INDEX "staff_positions_name_key" ON "staff_positions"("name");

-- CreateIndex
CREATE INDEX "staff_position_assignments_position_code_idx" ON "staff_position_assignments"("position_code");

-- CreateIndex
CREATE UNIQUE INDEX "parents_user_id_key" ON "parents"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "batches_name_key" ON "batches"("name");

-- CreateIndex
CREATE UNIQUE INDEX "batches_entry_year_key" ON "batches"("entry_year");

-- CreateIndex
CREATE UNIQUE INDEX "academic_years_name_key" ON "academic_years"("name");

-- CreateIndex
CREATE UNIQUE INDEX "classes_academic_year_id_name_key" ON "classes"("academic_year_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "students_nis_key" ON "students"("nis");

-- CreateIndex
CREATE UNIQUE INDEX "students_barcode_value_key" ON "students"("barcode_value");

-- CreateIndex
CREATE UNIQUE INDEX "students_rfid_uid_key" ON "students"("rfid_uid");

-- CreateIndex
CREATE UNIQUE INDEX "student_class_enrollments_student_id_class_id_start_date_key" ON "student_class_enrollments"("student_id", "class_id", "start_date");

-- CreateIndex
CREATE UNIQUE INDEX "parent_student_links_parent_id_student_id_key" ON "parent_student_links"("parent_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_code_key" ON "subjects"("code");

-- CreateIndex
CREATE UNIQUE INDEX "class_schedules_class_id_weekday_lesson_period_no_key" ON "class_schedules"("class_id", "weekday", "lesson_period_no");

-- CreateIndex
CREATE UNIQUE INDEX "class_schedules_teacher_staff_id_academic_year_id_weekday_l_key" ON "class_schedules"("teacher_staff_id", "academic_year_id", "weekday", "lesson_period_no");

-- CreateIndex
CREATE INDEX "bk_leave_permissions_student_id_attendance_date_start_perio_idx" ON "bk_leave_permissions"("student_id", "attendance_date", "start_period_no", "end_period_no", "status");

-- CreateIndex
CREATE INDEX "dispensation_students_student_id_class_id_idx" ON "dispensation_students"("student_id", "class_id");

-- CreateIndex
CREATE INDEX "attendance_period_statuses_student_id_attendance_date_lesso_idx" ON "attendance_period_statuses"("student_id", "attendance_date", "lesson_period_no");

-- CreateIndex
CREATE INDEX "attendance_period_statuses_class_id_attendance_date_lesson__idx" ON "attendance_period_statuses"("class_id", "attendance_date", "lesson_period_no");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_period_statuses_attendance_date_student_id_lesso_key" ON "attendance_period_statuses"("attendance_date", "student_id", "lesson_period_no");

-- CreateIndex
CREATE UNIQUE INDEX "tap_devices_device_code_key" ON "tap_devices"("device_code");

-- CreateIndex
CREATE INDEX "tap_events_student_id_tapped_at_idx" ON "tap_events"("student_id", "tapped_at");

-- CreateIndex
CREATE INDEX "tap_events_nis_input_tapped_at_idx" ON "tap_events"("nis_input", "tapped_at");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_code_fkey" FOREIGN KEY ("role_code") REFERENCES "roles"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staffs" ADD CONSTRAINT "staffs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_position_assignments" ADD CONSTRAINT "staff_position_assignments_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staffs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_position_assignments" ADD CONSTRAINT "staff_position_assignments_position_code_fkey" FOREIGN KEY ("position_code") REFERENCES "staff_positions"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parents" ADD CONSTRAINT "parents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_homeroom_staff_id_fkey" FOREIGN KEY ("homeroom_staff_id") REFERENCES "staffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_class_enrollments" ADD CONSTRAINT "student_class_enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_class_enrollments" ADD CONSTRAINT "student_class_enrollments_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_student_links" ADD CONSTRAINT "parent_student_links_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_student_links" ADD CONSTRAINT "parent_student_links_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_calendar_days" ADD CONSTRAINT "school_calendar_days_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_lesson_period_overrides" ADD CONSTRAINT "daily_lesson_period_overrides_calendar_date_fkey" FOREIGN KEY ("calendar_date") REFERENCES "school_calendar_days"("calendar_date") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_lesson_period_overrides" ADD CONSTRAINT "daily_lesson_period_overrides_lesson_period_no_fkey" FOREIGN KEY ("lesson_period_no") REFERENCES "lesson_periods"("period_no") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_lesson_period_overrides" ADD CONSTRAINT "daily_lesson_period_overrides_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_teacher_staff_id_fkey" FOREIGN KEY ("teacher_staff_id") REFERENCES "staffs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_lesson_period_no_fkey" FOREIGN KEY ("lesson_period_no") REFERENCES "lesson_periods"("period_no") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bk_leave_permissions" ADD CONSTRAINT "bk_leave_permissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bk_leave_permissions" ADD CONSTRAINT "bk_leave_permissions_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bk_leave_permissions" ADD CONSTRAINT "bk_leave_permissions_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bk_leave_permissions" ADD CONSTRAINT "bk_leave_permissions_approved_by_staff_id_fkey" FOREIGN KEY ("approved_by_staff_id") REFERENCES "staffs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bk_leave_permissions" ADD CONSTRAINT "bk_leave_permissions_start_period_no_fkey" FOREIGN KEY ("start_period_no") REFERENCES "lesson_periods"("period_no") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bk_leave_permissions" ADD CONSTRAINT "bk_leave_permissions_end_period_no_fkey" FOREIGN KEY ("end_period_no") REFERENCES "lesson_periods"("period_no") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bk_leave_permissions" ADD CONSTRAINT "bk_leave_permissions_expected_return_period_no_fkey" FOREIGN KEY ("expected_return_period_no") REFERENCES "lesson_periods"("period_no") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispensations" ADD CONSTRAINT "dispensations_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispensations" ADD CONSTRAINT "dispensations_approved_by_staff_id_fkey" FOREIGN KEY ("approved_by_staff_id") REFERENCES "staffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispensations" ADD CONSTRAINT "dispensations_start_period_no_fkey" FOREIGN KEY ("start_period_no") REFERENCES "lesson_periods"("period_no") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispensations" ADD CONSTRAINT "dispensations_end_period_no_fkey" FOREIGN KEY ("end_period_no") REFERENCES "lesson_periods"("period_no") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispensations" ADD CONSTRAINT "dispensations_expected_return_period_no_fkey" FOREIGN KEY ("expected_return_period_no") REFERENCES "lesson_periods"("period_no") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispensation_students" ADD CONSTRAINT "dispensation_students_dispensation_id_fkey" FOREIGN KEY ("dispensation_id") REFERENCES "dispensations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispensation_students" ADD CONSTRAINT "dispensation_students_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispensation_students" ADD CONSTRAINT "dispensation_students_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_period_statuses" ADD CONSTRAINT "attendance_period_statuses_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_period_statuses" ADD CONSTRAINT "attendance_period_statuses_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_period_statuses" ADD CONSTRAINT "attendance_period_statuses_lesson_period_no_fkey" FOREIGN KEY ("lesson_period_no") REFERENCES "lesson_periods"("period_no") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_period_statuses" ADD CONSTRAINT "attendance_period_statuses_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "class_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_period_statuses" ADD CONSTRAINT "attendance_period_statuses_marked_by_user_id_fkey" FOREIGN KEY ("marked_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_period_statuses" ADD CONSTRAINT "attendance_period_statuses_previous_attendance_status_id_fkey" FOREIGN KEY ("previous_attendance_status_id") REFERENCES "attendance_period_statuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_period_statuses" ADD CONSTRAINT "attendance_period_statuses_bk_permission_id_fkey" FOREIGN KEY ("bk_permission_id") REFERENCES "bk_leave_permissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_period_statuses" ADD CONSTRAINT "attendance_period_statuses_dispensation_id_fkey" FOREIGN KEY ("dispensation_id") REFERENCES "dispensations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_audit_logs" ADD CONSTRAINT "attendance_audit_logs_attendance_period_status_id_fkey" FOREIGN KEY ("attendance_period_status_id") REFERENCES "attendance_period_statuses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_audit_logs" ADD CONSTRAINT "attendance_audit_logs_changed_by_user_id_fkey" FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tap_events" ADD CONSTRAINT "tap_events_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tap_events" ADD CONSTRAINT "tap_events_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "tap_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tap_events" ADD CONSTRAINT "tap_events_linked_attendance_status_id_fkey" FOREIGN KEY ("linked_attendance_status_id") REFERENCES "attendance_period_statuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Custom business constraints not expressible directly in Prisma
ALTER TABLE "academic_years"
  ADD CONSTRAINT "chk_academic_year_range" CHECK ("end_date" >= "start_date");

CREATE UNIQUE INDEX "uq_academic_year_active"
  ON "academic_years" ("is_active")
  WHERE "is_active" = true;

ALTER TABLE "classes"
  ADD CONSTRAINT "chk_grade_level" CHECK ("grade_level" BETWEEN 1 AND 12);

ALTER TABLE "student_class_enrollments"
  ADD CONSTRAINT "chk_enrollment_range" CHECK ("end_date" IS NULL OR "end_date" >= "start_date");

CREATE UNIQUE INDEX "uq_student_active_enrollment"
  ON "student_class_enrollments" ("student_id")
  WHERE "is_active" = true;

CREATE UNIQUE INDEX "uq_staff_primary_position"
  ON "staff_position_assignments" ("staff_id")
  WHERE "is_primary" = true;

ALTER TABLE "lesson_periods"
  ADD CONSTRAINT "chk_period_no" CHECK ("period_no" BETWEEN 1 AND 20),
  ADD CONSTRAINT "chk_period_time" CHECK ("end_time" > "start_time");

ALTER TABLE "daily_lesson_period_overrides"
  ADD CONSTRAINT "chk_daily_period_override_time" CHECK ("end_time" > "start_time");

CREATE UNIQUE INDEX "uq_daily_period_override_global"
  ON "daily_lesson_period_overrides" ("calendar_date", "lesson_period_no")
  WHERE "class_id" IS NULL;

CREATE UNIQUE INDEX "uq_daily_period_override_per_class"
  ON "daily_lesson_period_overrides" ("calendar_date", "lesson_period_no", "class_id")
  WHERE "class_id" IS NOT NULL;

ALTER TABLE "bk_leave_permissions"
  ADD CONSTRAINT "chk_bk_period_range" CHECK ("start_period_no" <= "end_period_no"),
  ADD CONSTRAINT "chk_bk_return_rule" CHECK (
    ("return_required" = false AND "expected_return_period_no" IS NULL)
    OR
    ("return_required" = true AND "expected_return_period_no" IS NOT NULL AND "expected_return_period_no" > "end_period_no")
  );

ALTER TABLE "dispensations"
  ADD CONSTRAINT "chk_dispensation_period_range" CHECK ("start_period_no" <= "end_period_no"),
  ADD CONSTRAINT "chk_dispensation_return_rule" CHECK (
    ("return_required" = false AND "expected_return_period_no" IS NULL)
    OR
    ("return_required" = true AND "expected_return_period_no" IS NOT NULL AND "expected_return_period_no" > "end_period_no")
  );

CREATE UNIQUE INDEX "uq_tap_events_external_id"
  ON "tap_events" ("external_event_id")
  WHERE "external_event_id" IS NOT NULL;

CREATE UNIQUE INDEX "uq_tap_events_device_sequence"
  ON "tap_events" ("device_id", "device_sequence")
  WHERE "device_id" IS NOT NULL AND "device_sequence" IS NOT NULL;

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
