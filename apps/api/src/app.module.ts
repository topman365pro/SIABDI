import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { PrismaModule } from "./database/prisma.module";
import { AccessModule } from "./modules/access/access.module";
import { AttendanceModule } from "./modules/attendance/attendance.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BkPermissionsModule } from "./modules/bk-permissions/bk-permissions.module";
import { CalendarModule } from "./modules/calendar/calendar.module";
import { DispensationsModule } from "./modules/dispensations/dispensations.module";
import { DashboardsModule } from "./modules/dashboards/dashboards.module";
import { MasterDataModule } from "./modules/master-data/master-data.module";
import { TapEventsModule } from "./modules/tap-events/tap-events.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "../../.env"]
    }),
    PrismaModule,
    AuthModule,
    AccessModule,
    MasterDataModule,
    CalendarModule,
    AttendanceModule,
    BkPermissionsModule,
    DispensationsModule,
    DashboardsModule,
    TapEventsModule
  ],
  controllers: [AppController]
})
export class AppModule {}
