import type { RoleCode } from "../../generated/prisma/client";

export interface CurrentUserPayload {
  sub: string;
  username: string;
  fullName: string;
  roleCodes: RoleCode[];
  refreshToken?: string;
}
