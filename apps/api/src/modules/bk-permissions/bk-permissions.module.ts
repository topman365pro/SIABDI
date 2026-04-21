import { Module } from "@nestjs/common";
import { AttendanceModule } from "../attendance/attendance.module";
import { BkPermissionsController } from "./bk-permissions.controller";
import { BkPermissionsService } from "./bk-permissions.service";

@Module({
  imports: [AttendanceModule],
  controllers: [BkPermissionsController],
  providers: [BkPermissionsService],
  exports: [BkPermissionsService]
})
export class BkPermissionsModule {}
