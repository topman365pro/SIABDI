import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { RoleCode, StaffPositionCode } from "../../generated/prisma/client";

@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaService) {}

  getRoles() {
    return this.prisma.role.findMany({
      orderBy: { name: "asc" }
    });
  }

  async assignUserRoles(userId: string, roleCodes: RoleCode[]) {
    return this.prisma.$transaction(async (tx: any) => {
      await tx.userRole.deleteMany({ where: { userId } });
      await tx.userRole.createMany({
        data: roleCodes.map((roleCode) => ({
          userId,
          roleCode
        }))
      });

      return tx.user.findUnique({
        where: { id: userId },
        include: { roles: true }
      });
    });
  }

  async assignStaffPositions(staffId: string, positionCodes: StaffPositionCode[]) {
    return this.prisma.$transaction(async (tx: any) => {
      await tx.staffPositionAssignment.deleteMany({ where: { staffId } });
      await tx.staffPositionAssignment.createMany({
        data: positionCodes.map((positionCode, index) => ({
          staffId,
          positionCode,
          isPrimary: index === 0
        }))
      });

      return tx.staff.findUnique({
        where: { id: staffId },
        include: { positions: true }
      });
    });
  }
}
