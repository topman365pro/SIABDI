import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAccessGuard } from "../../common/guards/jwt-access.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import type { CurrentUserPayload } from "../../common/types/current-user.type";
import { RoleCode } from "../../generated/prisma/client";
import { AddDispensationStudentsDto, CreateDispensationDto } from "./dto";
import { DispensationsService } from "./dispensations.service";

@ApiTags("dispensations")
@ApiBearerAuth()
@UseGuards(JwtAccessGuard, RolesGuard)
@Controller("dispensations")
export class DispensationsController {
  constructor(private readonly dispensationsService: DispensationsService) {}

  @Roles(RoleCode.KESISWAAN, RoleCode.ADMIN_TU)
  @Post()
  create(@Body() body: CreateDispensationDto, @CurrentUser() currentUser: CurrentUserPayload) {
    return this.dispensationsService.create(body, currentUser);
  }

  @Roles(RoleCode.KESISWAAN, RoleCode.ADMIN_TU)
  @Post(":id/students")
  addStudents(@Param("id") id: string, @Body() body: AddDispensationStudentsDto) {
    return this.dispensationsService.addStudents(id, body);
  }

  @Roles(RoleCode.KESISWAAN)
  @Patch(":id/publish")
  publish(@Param("id") id: string, @CurrentUser() currentUser: CurrentUserPayload) {
    return this.dispensationsService.publish(id, currentUser);
  }

  @Roles(RoleCode.KESISWAAN, RoleCode.ADMIN_TU)
  @Patch(":id/cancel")
  cancel(@Param("id") id: string, @CurrentUser() currentUser: CurrentUserPayload) {
    return this.dispensationsService.cancel(id, currentUser);
  }

  @Roles(RoleCode.KESISWAAN, RoleCode.ADMIN_TU, RoleCode.BK, RoleCode.GURU_MAPEL)
  @Get()
  list() {
    return this.dispensationsService.list();
  }

  @Roles(RoleCode.KESISWAAN, RoleCode.ADMIN_TU, RoleCode.BK, RoleCode.GURU_MAPEL)
  @Get(":id")
  getById(@Param("id") id: string) {
    return this.dispensationsService.getById(id);
  }
}
