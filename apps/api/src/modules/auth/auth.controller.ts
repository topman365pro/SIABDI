import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAccessGuard } from "../../common/guards/jwt-access.guard";
import { JwtRefreshGuard } from "../../common/guards/jwt-refresh.guard";
import type { CurrentUserPayload } from "../../common/types/current-user.type";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body() body: LoginDto) {
    return this.authService.login(body.username, body.password);
  }

  @ApiBearerAuth()
  @UseGuards(JwtRefreshGuard)
  @Post("refresh")
  refresh(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.authService.refresh(currentUser);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @Post("logout")
  logout(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.authService.logout(currentUser.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @Get("me")
  me(@CurrentUser() currentUser: CurrentUserPayload) {
    return currentUser;
  }
}
