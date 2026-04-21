import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAccessGuard } from "../../common/guards/jwt-access.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { RoleCode } from "../../generated/prisma/client";
import { CalendarService } from "./calendar.service";

@ApiTags("calendar")
@ApiBearerAuth()
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(RoleCode.ADMIN_TU)
@Controller()
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get("calendar-days")
  listCalendarDays() {
    return this.calendarService.listCalendarDays();
  }

  @Post("calendar-days")
  createCalendarDay(@Body() body: Record<string, unknown>) {
    return this.calendarService.createCalendarDay(body);
  }

  @Get("calendar-days/:date")
  getCalendarDay(@Param("date") date: string) {
    return this.calendarService.getCalendarDay(new Date(date));
  }

  @Patch("calendar-days/:date")
  updateCalendarDay(@Param("date") date: string, @Body() body: Record<string, unknown>) {
    return this.calendarService.updateCalendarDay(new Date(date), body);
  }

  @Delete("calendar-days/:date")
  deleteCalendarDay(@Param("date") date: string) {
    return this.calendarService.deleteCalendarDay(new Date(date));
  }

  @Get("daily-period-overrides")
  listOverrides() {
    return this.calendarService.listOverrides();
  }

  @Post("daily-period-overrides")
  createOverride(@Body() body: Record<string, unknown>) {
    return this.calendarService.createOverride(body);
  }

  @Get("daily-period-overrides/:id")
  getOverride(@Param("id") id: string) {
    return this.calendarService.getOverride(id);
  }

  @Patch("daily-period-overrides/:id")
  updateOverride(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return this.calendarService.updateOverride(id, body);
  }

  @Delete("daily-period-overrides/:id")
  deleteOverride(@Param("id") id: string) {
    return this.calendarService.deleteOverride(id);
  }
}
