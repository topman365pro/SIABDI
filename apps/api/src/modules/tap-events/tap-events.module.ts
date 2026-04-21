import { Module } from "@nestjs/common";
import { TapEventsController } from "./tap-events.controller";
import { TapEventsService } from "./tap-events.service";

@Module({
  controllers: [TapEventsController],
  providers: [TapEventsService]
})
export class TapEventsModule {}
