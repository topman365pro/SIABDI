export type RoleCode = "ADMIN_TU" | "KESISWAAN" | "BK" | "GURU_MAPEL" | "ORANG_TUA";

export type AttendanceStatus =
  | "HADIR"
  | "ALFA"
  | "IZIN"
  | "SAKIT"
  | "DISPENSASI"
  | "BOLOS";

export interface CurrentUser {
  sub: string;
  username: string;
  fullName: string;
  roleCodes: RoleCode[];
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: CurrentUser;
}

export interface AttendanceStatusViewModel {
  value: AttendanceStatus;
  label: string;
  tone: "neutral" | "success" | "warning" | "danger" | "accent";
}

export interface TeacherScheduleItem {
  id: string;
  lessonPeriodNo: number;
  weekday: string;
  roomName?: string | null;
  class: {
    id: string;
    name: string;
  };
  subject: {
    id: string;
    name: string;
  };
  lessonPeriod: {
    periodNo: number;
    label: string;
    startTime: string;
    endTime: string;
  };
}

export interface ClassPeriodRosterItem {
  student: {
    id: string;
    nis: string;
    fullName: string;
  };
  status: {
    id: string;
    status: AttendanceStatus;
    note?: string | null;
    source: string;
  } | null;
}

export interface ParentStudentSummary {
  id: string;
  nis: string;
  fullName: string;
  relationship: string;
  currentClass?: {
    id: string;
    name: string;
  } | null;
}

export interface StudentHistoryEntry {
  id: string;
  attendanceDate: string;
  lessonPeriodNo: number;
  status: AttendanceStatus;
  note?: string | null;
  source: string;
}

export interface BkPermissionFormInput {
  studentId: string;
  classId: string;
  attendanceDate: string;
  permissionKind: "IZIN" | "SAKIT";
  startPeriodNo: number;
  endPeriodNo: number;
  returnRequired: boolean;
  expectedReturnPeriodNo?: number;
  reason: string;
  letterNumber?: string;
}

export interface DispensationFormInput {
  title: string;
  description?: string;
  attendanceDate: string;
  startPeriodNo: number;
  endPeriodNo: number;
  returnRequired: boolean;
  expectedReturnPeriodNo?: number;
  letterNumber?: string;
}
