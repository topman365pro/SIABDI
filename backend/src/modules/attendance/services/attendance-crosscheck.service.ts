export type AttendanceStatus = 'HADIR' | 'ALFA' | 'IZIN' | 'SAKIT' | 'DISPENSASI' | 'BOLOS';
export type AttendanceSource =
  | 'BASE_CHECK'
  | 'CROSS_CHECK'
  | 'BK_PERMISSION'
  | 'DISPENSATION'
  | 'SYSTEM_DERIVED'
  | 'TAP_IN'
  | 'TAP_OUT'
  | 'MANUAL_ADMIN';

export type TeacherObservation = 'PRESENT' | 'ABSENT';

export interface AttendanceContext {
  studentId: string;
  classId: string;
  attendanceDate: string;
  lessonPeriodNo: number;
  scheduleId: string;
  actorUserId: string;
  note?: string;
  teacherObservation: TeacherObservation;
}

export interface AttendanceSnapshot {
  id: string;
  status: AttendanceStatus;
  lessonPeriodNo: number;
}

export interface ActiveAuthorization {
  type: 'BK_PERMISSION' | 'DISPENSATION';
  referenceId: string;
  attendanceStatus?: 'IZIN' | 'SAKIT';
}

export interface ReturnExpectation {
  type: 'BK_PERMISSION' | 'DISPENSATION';
  referenceId: string;
  expectedReturnPeriodNo: number;
}

export interface UpsertAttendancePayload {
  attendanceDate: string;
  studentId: string;
  classId: string;
  lessonPeriodNo: number;
  scheduleId: string;
  status: AttendanceStatus;
  source: AttendanceSource;
  markedByUserId: string;
  note?: string;
  previousAttendanceStatusId?: string;
  bkPermissionId?: string;
  dispensationId?: string;
}

export interface StoredAttendanceStatus {
  id: string;
  status: AttendanceStatus;
}

export interface AttendanceCrossCheckRepository {
  withTransaction<T>(
    callback: (repo: AttendanceCrossCheckRepository) => Promise<T>,
  ): Promise<T>;
  getPreviousStatus(input: {
    studentId: string;
    attendanceDate: string;
    lessonPeriodNo: number;
  }): Promise<AttendanceSnapshot | null>;
  hasAnyPresenceBefore(input: {
    studentId: string;
    attendanceDate: string;
    lessonPeriodNo: number;
  }): Promise<boolean>;
  getActiveAuthorization(input: {
    studentId: string;
    attendanceDate: string;
    lessonPeriodNo: number;
  }): Promise<ActiveAuthorization | null>;
  getOutstandingReturnExpectation(input: {
    studentId: string;
    attendanceDate: string;
    lessonPeriodNo: number;
  }): Promise<ReturnExpectation | null>;
  upsertAttendanceStatus(payload: UpsertAttendancePayload): Promise<StoredAttendanceStatus>;
  insertAuditLog(payload: {
    attendancePeriodStatusId: string;
    previousStatus: AttendanceStatus | null;
    newStatus: AttendanceStatus;
    changeSource: AttendanceSource;
    changedByUserId: string;
    reason?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void>;
}

export class AttendanceCrossCheckService {
  constructor(private readonly repository: AttendanceCrossCheckRepository) {}

  async crossCheckPeriod(input: AttendanceContext): Promise<StoredAttendanceStatus> {
    if (input.lessonPeriodNo <= 1) {
      throw new Error('Cross-check only applies from period 2 onwards. Use base check for period 1.');
    }

    return this.repository.withTransaction(async (repo) => {
      const previousStatus = await repo.getPreviousStatus({
        studentId: input.studentId,
        attendanceDate: input.attendanceDate,
        lessonPeriodNo: input.lessonPeriodNo,
      });

      const hasAnyPresenceBefore = await repo.hasAnyPresenceBefore({
        studentId: input.studentId,
        attendanceDate: input.attendanceDate,
        lessonPeriodNo: input.lessonPeriodNo,
      });

      const authorization = await repo.getActiveAuthorization({
        studentId: input.studentId,
        attendanceDate: input.attendanceDate,
        lessonPeriodNo: input.lessonPeriodNo,
      });

      const returnExpectation = await repo.getOutstandingReturnExpectation({
        studentId: input.studentId,
        attendanceDate: input.attendanceDate,
        lessonPeriodNo: input.lessonPeriodNo,
      });

      const decision = this.resolveStatus({
        teacherObservation: input.teacherObservation,
        previousStatus: previousStatus?.status ?? null,
        hasAnyPresenceBefore,
        authorization,
        returnExpectation,
      });

      const saved = await repo.upsertAttendanceStatus({
        attendanceDate: input.attendanceDate,
        studentId: input.studentId,
        classId: input.classId,
        lessonPeriodNo: input.lessonPeriodNo,
        scheduleId: input.scheduleId,
        status: decision.status,
        source: decision.source,
        markedByUserId: input.actorUserId,
        note: input.note,
        previousAttendanceStatusId: previousStatus?.id,
        bkPermissionId:
          authorization?.type === 'BK_PERMISSION' ? authorization.referenceId : undefined,
        dispensationId:
          authorization?.type === 'DISPENSATION' ? authorization.referenceId : undefined,
      });

      await repo.insertAuditLog({
        attendancePeriodStatusId: saved.id,
        previousStatus: previousStatus?.status ?? null,
        newStatus: decision.status,
        changeSource: decision.source,
        changedByUserId: input.actorUserId,
        reason: input.note,
        metadata: {
          teacherObservation: input.teacherObservation,
          hadPresenceEarlierToday: hasAnyPresenceBefore,
          authorizationType: authorization?.type ?? null,
          authorizationReferenceId: authorization?.referenceId ?? null,
          returnExpectationType: returnExpectation?.type ?? null,
          returnExpectationReferenceId: returnExpectation?.referenceId ?? null,
          expectedReturnPeriodNo: returnExpectation?.expectedReturnPeriodNo ?? null,
          previousLessonPeriodNo: previousStatus?.lessonPeriodNo ?? null,
        },
      });

      return saved;
    });
  }

  private resolveStatus(input: {
    teacherObservation: TeacherObservation;
    previousStatus: AttendanceStatus | null;
    hasAnyPresenceBefore: boolean;
    authorization: ActiveAuthorization | null;
    returnExpectation: ReturnExpectation | null;
  }): { status: AttendanceStatus; source: AttendanceSource } {
    if (input.authorization?.type === 'DISPENSATION') {
      return {
        status: 'DISPENSASI',
        source: 'DISPENSATION',
      };
    }

    if (input.authorization?.type === 'BK_PERMISSION') {
      return {
        status: input.authorization.attendanceStatus ?? 'IZIN',
        source: 'BK_PERMISSION',
      };
    }

    if (input.teacherObservation === 'PRESENT') {
      return {
        status: 'HADIR',
        source: 'CROSS_CHECK',
      };
    }

    // Authorization can end before the school day ends. If the student was
    // expected to return by this period and is still absent, treat it as truancy.
    if (input.returnExpectation) {
      return {
        status: 'BOLOS',
        source: 'CROSS_CHECK',
      };
    }

    if (input.previousStatus === 'BOLOS') {
      return {
        status: 'BOLOS',
        source: 'SYSTEM_DERIVED',
      };
    }

    // If the student has already been physically present earlier in the day
    // and is now absent without active authorization, treat it as truancy.
    if (input.hasAnyPresenceBefore || input.previousStatus === 'HADIR') {
      return {
        status: 'BOLOS',
        source: 'CROSS_CHECK',
      };
    }

    return {
      status: 'ALFA',
      source: 'CROSS_CHECK',
    };
  }
}
