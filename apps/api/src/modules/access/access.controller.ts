import { Body, Controller, Get, Param, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAccessGuard } from "../../common/guards/jwt-access.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { RoleCode } from "../../generated/prisma/client";
import { AccessService } from "./access.service";
import { AssignRolesDto, AssignStaffPositionsDto } from "./dto";

@ApiTags("access")
@ApiBearerAuth()
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(RoleCode.ADMIN_TU)
@Controller()
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  @Get("roles")
  getRoles() {
    return this.accessService.getRoles();
  }

  @Put("users/:id/roles")
  assignUserRoles(@Param("id") userId: string, @Body() body: AssignRolesDto) {
    return this.accessService.assignUserRoles(userId, body.roleCodes);
  }

  @Put("staffs/:id/positions")
  assignStaffPositions(@Param("id") staffId: string, @Body() body: AssignStaffPositionsDto) {
    return this.accessService.assignStaffPositions(staffId, body.positionCodes);
  }
}
