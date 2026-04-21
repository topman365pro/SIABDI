import { Module } from "@nestjs/common";
import { AttendanceModule } from "../attendance/attendance.module";
import { DashboardsController } from "./dashboards.controller";
import { DashboardsService } from "./dashboards.service";

@Module({
  imports: [AttendanceModule],
  controllers: [DashboardsController],
  providers: [DashboardsService]
})
export class DashboardsModule {}
