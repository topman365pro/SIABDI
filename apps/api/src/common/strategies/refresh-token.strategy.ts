import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { Request } from "express";
import type { CurrentUserPayload } from "../types/current-user.type";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
      passReqToCallback: true
    });
  }

  validate(request: Request, payload: CurrentUserPayload): CurrentUserPayload {
    const authHeader = request.headers.authorization;
    const refreshToken = authHeader?.replace(/^Bearer\s+/i, "").trim();

    return {
      ...payload,
      refreshToken
    };
  }
}
