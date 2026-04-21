import { Module } from "@nestjs/common";
import { AttendanceModule } from "../attendance/attendance.module";
import { DispensationsController } from "./dispensations.controller";
import { DispensationsService } from "./dispensations.service";

@Module({
  imports: [AttendanceModule],
  controllers: [DispensationsController],
  providers: [DispensationsService]
})
export class DispensationsModule {}
