import { describe, expect, it } from "vitest";
import { ATTENDANCE_STATUS_MAP } from "@/lib/config/status";

describe("attendance status map", () => {
  it("normalizes HADIR to Masuk", () => {
    expect(ATTENDANCE_STATUS_MAP.HADIR.label).toBe("Masuk");
  });

  it("marks BOLOS as danger tone", () => {
    expect(ATTENDANCE_STATUS_MAP.BOLOS.tone).toBe("danger");
  });
});
