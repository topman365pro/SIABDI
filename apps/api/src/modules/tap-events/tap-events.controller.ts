import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAccessGuard } from "../../common/guards/jwt-access.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { RoleCode } from "../../generated/prisma/client";
import { CreateRawTapEventDto, CreateTapEventDto } from "./dto";
import { TapEventsService } from "./tap-events.service";

@ApiTags("tap-events")
@ApiBearerAuth()
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(RoleCode.ADMIN_TU)
@Controller("tap-events")
export class TapEventsController {
  constructor(private readonly tapEventsService: TapEventsService) {}

  @Post("tap-in")
  tapIn(@Body() body: CreateTapEventDto) {
    return this.tapEventsService.tapIn(body);
  }

  @Post("tap-out")
  tapOut(@Body() body: CreateTapEventDto) {
    return this.tapEventsService.tapOut(body);
  }

  @Post("raw")
  createRaw(@Body() body: CreateRawTapEventDto) {
    return this.tapEventsService.createTapEvent(body);
  }

  @Get()
  list() {
    return this.tapEventsService.list();
  }
}
