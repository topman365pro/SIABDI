import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  listCalendarDays() {
    return this.prisma.schoolCalendarDay.findMany({
      orderBy: { calendarDate: "asc" }
    });
  }

  createCalendarDay(data: Record<string, unknown>) {
    return this.prisma.schoolCalendarDay.create({ data: data as any });
  }

  getCalendarDay(calendarDate: Date) {
    return this.prisma.schoolCalendarDay.findUnique({ where: { calendarDate } });
  }

  updateCalendarDay(calendarDate: Date, data: Record<string, unknown>) {
    return this.prisma.schoolCalendarDay.update({
      where: { calendarDate },
      data: data as any
    });
  }

  deleteCalendarDay(calendarDate: Date) {
    return this.prisma.schoolCalendarDay.delete({ where: { calendarDate } });
  }

  listOverrides() {
    return this.prisma.dailyLessonPeriodOverride.findMany({
      orderBy: [{ calendarDate: "asc" }, { lessonPeriodNo: "asc" }]
    });
  }

  createOverride(data: Record<string, unknown>) {
    return this.prisma.dailyLessonPeriodOverride.create({ data: data as any });
  }

  getOverride(id: string) {
    return this.prisma.dailyLessonPeriodOverride.findUnique({ where: { id } });
  }

  updateOverride(id: string, data: Record<string, unknown>) {
    return this.prisma.dailyLessonPeriodOverride.update({ where: { id }, data: data as any });
  }

  deleteOverride(id: string) {
    return this.prisma.dailyLessonPeriodOverride.delete({ where: { id } });
  }
}
