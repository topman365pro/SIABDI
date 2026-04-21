import type { CurrentUser, RoleCode } from "@/lib/types";
import { decodeCurrentUser } from "./session";

export const PRIMARY_ROLE_ORDER: RoleCode[] = [
  "ADMIN_TU",
  "BK",
  "KESISWAAN",
  "GURU_MAPEL",
  "ORANG_TUA"
];

const routeAccess: Array<{ prefix: string; roles: RoleCode[] }> = [
  { prefix: "/app/admin", roles: ["ADMIN_TU"] },
  { prefix: "/app/bk", roles: ["BK", "ADMIN_TU"] },
  { prefix: "/app/kesiswaan", roles: ["KESISWAAN", "ADMIN_TU"] },
  { prefix: "/app/guru", roles: ["GURU_MAPEL", "ADMIN_TU"] },
  { prefix: "/portal", roles: ["ORANG_TUA"] },
  { prefix: "/app", roles: ["ADMIN_TU", "BK", "KESISWAAN", "GURU_MAPEL"] }
];

export function getPrimaryRole(roleCodes: RoleCode[]) {
  return PRIMARY_ROLE_ORDER.find((role) => roleCodes.includes(role)) ?? null;
}

export function getRoleHomePath(role: RoleCode) {
  switch (role) {
    case "ADMIN_TU":
      return "/app/admin/overview";
    case "BK":
      return "/app/bk/dashboard";
    case "KESISWAAN":
      return "/app/kesiswaan/dashboard";
    case "GURU_MAPEL":
      return "/app/guru/dashboard";
    case "ORANG_TUA":
      return "/portal";
  }
}

export function canAccessPath(roleCodes: RoleCode[], pathname: string) {
  const match = routeAccess.find((entry) => pathname.startsWith(entry.prefix));
  if (!match) {
    return true;
  }

  return match.roles.some((role) => roleCodes.includes(role));
}

export function parseCurrentUserCookie(value?: string | null): CurrentUser | null {
  return decodeCurrentUser(value);
}
