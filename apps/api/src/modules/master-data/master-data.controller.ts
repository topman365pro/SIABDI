import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAccessGuard } from "../../common/guards/jwt-access.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { RoleCode } from "../../generated/prisma/client";
import { MasterDataService } from "./master-data.service";

@ApiTags("master-data")
@ApiBearerAuth()
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(RoleCode.ADMIN_TU)
@Controller()
export class MasterDataController {
  constructor(private readonly masterDataService: MasterDataService) {}

  @Get("batches")
  listBatches() {
    return this.masterDataService.list("batch");
  }

  @Post("batches")
  createBatch(@Body() body: Record<string, unknown>) {
    return this.masterDataService.create("batch", body);
  }

  @Get("batches/:id")
  getBatch(@Param("id") id: string) {
    return this.masterDataService.get("batch", { id });
  }

  @Patch("batches/:id")
  updateBatch(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return this.masterDataService.update("batch", { id }, body);
  }

  @Delete("batches/:id")
  deleteBatch(@Param("id") id: string) {
    return this.masterDataService.remove("batch", { id });
  }

  @Get("academic-years")
  listAcademicYears() {
    return this.masterDataService.list("academicYear");
  }

  @Post("academic-years")
  createAcademicYear(@Body() body: Record<string, unknown>) {
    return this.masterDataService.create("academicYear", body);
  }

  @Get("academic-years/:id")
  getAcademicYear(@Param("id") id: string) {
    return this.masterDataService.get("academicYear", { id });
  }

  @Patch("academic-years/:id")
  updateAcademicYear(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return this.masterDataService.update("academicYear", { id }, body);
  }

  @Delete("academic-years/:id")
  deleteAcademicYear(@Param("id") id: string) {
    return this.masterDataService.remove("academicYear", { id });
  }

  @Get("classes")
  listClasses() {
    return this.masterDataService.list("class");
  }

  @Post("classes")
  createClass(@Body() body: Record<string, unknown>) {
    return this.masterDataService.create("class", body);
  }

  @Get("classes/:id")
  getClass(@Param("id") id: string) {
    return this.masterDataService.get("class", { id });
  }

  @Patch("classes/:id")
  updateClass(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return this.masterDataService.update("class", { id }, body);
  }

  @Delete("classes/:id")
  deleteClass(@Param("id") id: string) {
    return this.masterDataService.remove("class", { id });
  }

  @Get("students")
  listStudents() {
    return this.masterDataService.list("student");
  }

  @Post("students")
  createStudent(@Body() body: Record<string, unknown>) {
    return this.masterDataService.create("student", body);
  }

  @Get("students/:id")
  getStudent(@Param("id") id: string) {
    return this.masterDataService.get("student", { id });
  }

  @Patch("students/:id")
  updateStudent(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return this.masterDataService.update("student", { id }, body);
  }

  @Delete("students/:id")
  deleteStudent(@Param("id") id: string) {
    return this.masterDataService.remove("student", { id });
  }

  @Post("students/:id/enrollments")
  createEnrollment(@Param("id") studentId: string, @Body() body: Record<string, unknown>) {
    return this.masterDataService.createEnrollment({
      ...body,
      studentId
    });
  }

  @Get("enrollments")
  listEnrollments() {
    return this.masterDataService.listEnrollments();
  }

  @Get("enrollments/:id")
  getEnrollment(@Param("id") id: string) {
    return this.masterDataService.getEnrollment(id);
  }

  @Patch("enrollments/:id")
  updateEnrollment(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return this.masterDataService.updateEnrollment(id, body);
  }

  @Delete("enrollments/:id")
  deleteEnrollment(@Param("id") id: string) {
    return this.masterDataService.deleteEnrollment(id);
  }

  @Get("staffs")
  listStaffs() {
    return this.masterDataService.list("staff");
  }

  @Post("staffs")
  createStaff(@Body() body: Record<string, unknown>) {
    return this.masterDataService.create("staff", body);
  }

  @Get("staffs/:id")
  getStaff(@Param("id") id: string) {
    return this.masterDataService.get("staff", { id });
  }

  @Patch("staffs/:id")
  updateStaff(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return this.masterDataService.update("staff", { id }, body);
  }

  @Delete("staffs/:id")
  deleteStaff(@Param("id") id: string) {
    return this.masterDataService.remove("staff", { id });
  }

  @Get("parents")
  listParents() {
    return this.masterDataService.list("parent");
  }

  @Post("parents")
  createParent(@Body() body: Record<string, unknown>) {
    return this.masterDataService.create("parent", body);
  }

  @Get("parents/:id")
  getParent(@Param("id") id: string) {
    return this.masterDataService.get("parent", { id });
  }

  @Patch("parents/:id")
  updateParent(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return this.masterDataService.update("parent", { id }, body);
  }

  @Delete("parents/:id")
  deleteParent(@Param("id") id: string) {
    return this.masterDataService.remove("parent", { id });
  }

  @Post("parents/:id/students/:studentId/link")
  linkParentToStudent(
    @Param("id") parentId: string,
    @Param("studentId") studentId: string,
    @Body() body: { relationship: string; isPrimary?: boolean }
  ) {
    return this.masterDataService.linkParentToStudent(
      parentId,
      studentId,
      body.relationship,
      body.isPrimary ?? false
    );
  }

  @Get("subjects")
  listSubjects() {
    return this.masterDataService.list("subject");
  }

  @Post("subjects")
  createSubject(@Body() body: Record<string, unknown>) {
    return this.masterDataService.create("subject", body);
  }

  @Get("subjects/:id")
  getSubject(@Param("id") id: string) {
    return this.masterDataService.get("subject", { id });
  }

  @Patch("subjects/:id")
  updateSubject(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return this.masterDataService.update("subject", { id }, body);
  }

  @Delete("subjects/:id")
  deleteSubject(@Param("id") id: string) {
    return this.masterDataService.remove("subject", { id });
  }

  @Get("lesson-periods")
  listLessonPeriods() {
    return this.masterDataService.list("lessonPeriod");
  }

  @Post("lesson-periods")
  createLessonPeriod(@Body() body: Record<string, unknown>) {
    return this.masterDataService.create("lessonPeriod", body);
  }

  @Get("lesson-periods/:periodNo")
  getLessonPeriod(@Param("periodNo", ParseIntPipe) periodNo: number) {
    return this.masterDataService.get("lessonPeriod", { periodNo });
  }

  @Patch("lesson-periods/:periodNo")
  updateLessonPeriod(
    @Param("periodNo", ParseIntPipe) periodNo: number,
    @Body() body: Record<string, unknown>
  ) {
    return this.masterDataService.update("lessonPeriod", { periodNo }, body);
  }

  @Delete("lesson-periods/:periodNo")
  deleteLessonPeriod(@Param("periodNo", ParseIntPipe) periodNo: number) {
    return this.masterDataService.remove("lessonPeriod", { periodNo });
  }

  @Get("schedules")
  listSchedules() {
    return this.masterDataService.list("classSchedule");
  }

  @Post("schedules")
  createSchedule(@Body() body: Record<string, unknown>) {
    return this.masterDataService.create("classSchedule", body);
  }

  @Get("schedules/:id")
  getSchedule(@Param("id") id: string) {
    return this.masterDataService.get("classSchedule", { id });
  }

  @Patch("schedules/:id")
  updateSchedule(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return this.masterDataService.update("classSchedule", { id }, body);
  }

  @Delete("schedules/:id")
  deleteSchedule(@Param("id") id: string) {
    return this.masterDataService.remove("classSchedule", { id });
  }
}
