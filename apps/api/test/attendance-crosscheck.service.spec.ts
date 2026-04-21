import { AttendanceCrossCheckService } from "../src/modules/attendance/attendance-crosscheck.service";
import { TeacherObservation } from "../src/modules/attendance/dto";

describe("AttendanceCrossCheckService", () => {
  const service = new AttendanceCrossCheckService({} as never);

  it("prioritizes dispensation over all other inputs", () => {
    expect(
      service.resolveStatus({
        teacherObservation: TeacherObservation.ABSENT,
        previousStatus: "HADIR",
        hasAnyPresenceBefore: true,
        authorization: {
          type: "DISPENSATION",
          referenceId: "disp-1"
        },
        returnExpectation: null
      })
    ).toEqual({
      status: "DISPENSASI",
      source: "DISPENSATION"
    });
  });

  it("returns SAKIT when BK authorization says sakit", () => {
    expect(
      service.resolveStatus({
        teacherObservation: TeacherObservation.ABSENT,
        previousStatus: "HADIR",
        hasAnyPresenceBefore: true,
        authorization: {
          type: "BK_PERMISSION",
          referenceId: "bk-1",
          attendanceStatus: "SAKIT"
        },
        returnExpectation: null
      })
    ).toEqual({
      status: "SAKIT",
      source: "BK_PERMISSION"
    });
  });

  it("returns IZIN when BK authorization says izin", () => {
    expect(
      service.resolveStatus({
        teacherObservation: TeacherObservation.ABSENT,
        previousStatus: "HADIR",
        hasAnyPresenceBefore: true,
        authorization: {
          type: "BK_PERMISSION",
          referenceId: "bk-1",
          attendanceStatus: "IZIN"
        },
        returnExpectation: null
      })
    ).toEqual({
      status: "IZIN",
      source: "BK_PERMISSION"
    });
  });

  it("marks BOLOS when return expectation is overdue", () => {
    expect(
      service.resolveStatus({
        teacherObservation: TeacherObservation.ABSENT,
        previousStatus: "IZIN",
        hasAnyPresenceBefore: true,
        authorization: null,
        returnExpectation: {
          type: "BK_PERMISSION",
          referenceId: "bk-2",
          expectedReturnPeriodNo: 7
        }
      })
    ).toEqual({
      status: "BOLOS",
      source: "CROSS_CHECK"
    });
  });

  it("marks HADIR when teacher sees the student present", () => {
    expect(
      service.resolveStatus({
        teacherObservation: TeacherObservation.PRESENT,
        previousStatus: "ALFA",
        hasAnyPresenceBefore: false,
        authorization: null,
        returnExpectation: null
      })
    ).toEqual({
      status: "HADIR",
      source: "CROSS_CHECK"
    });
  });

  it("keeps BOLOS baseline once a student is already marked bolos", () => {
    expect(
      service.resolveStatus({
        teacherObservation: TeacherObservation.ABSENT,
        previousStatus: "BOLOS",
        hasAnyPresenceBefore: false,
        authorization: null,
        returnExpectation: null
      })
    ).toEqual({
      status: "BOLOS",
      source: "SYSTEM_DERIVED"
    });
  });

  it("marks BOLOS when student was previously present and is now absent without authorization", () => {
    expect(
      service.resolveStatus({
        teacherObservation: TeacherObservation.ABSENT,
        previousStatus: "HADIR",
        hasAnyPresenceBefore: true,
        authorization: null,
        returnExpectation: null
      })
    ).toEqual({
      status: "BOLOS",
      source: "CROSS_CHECK"
    });
  });

  it("falls back to ALFA when there is no prior presence and no authorization", () => {
    expect(
      service.resolveStatus({
        teacherObservation: TeacherObservation.ABSENT,
        previousStatus: null,
        hasAnyPresenceBefore: false,
        authorization: null,
        returnExpectation: null
      })
    ).toEqual({
      status: "ALFA",
      source: "CROSS_CHECK"
    });
  });
});
