import { describe, expect, it } from "vitest";
import { canAccessPath, getPrimaryRole, getRoleHomePath } from "@/lib/auth/roles";

describe("role helpers", () => {
  it("returns the highest-priority role", () => {
    expect(getPrimaryRole(["ORANG_TUA", "BK"])).toBe("BK");
  });

  it("maps a role to its home path", () => {
    expect(getRoleHomePath("GURU_MAPEL")).toBe("/app/guru/dashboard");
  });

  it("blocks parent users from internal paths", () => {
    expect(canAccessPath(["ORANG_TUA"], "/app/admin/overview")).toBe(false);
  });
});
