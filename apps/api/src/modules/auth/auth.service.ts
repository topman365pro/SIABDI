import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import type { RoleCode } from "../../generated/prisma/client";
import { PrismaService } from "../../database/prisma.service";
import type { CurrentUserPayload } from "../../common/types/current-user.type";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        roles: true
      }
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    const payload = this.buildPayload(
      user.id,
      user.username,
      user.fullName,
      user.roles.map((role: { roleCode: RoleCode }) => role.roleCode)
    );

    const tokens = await this.signTokens(payload);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10)
      }
    });

    return {
      user: payload,
      ...tokens
    };
  }

  async refresh(currentUser: CurrentUserPayload) {
    if (!currentUser.refreshToken) {
      throw new UnauthorizedException("Missing refresh token.");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.sub },
      include: {
        roles: true
      }
    });

    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException("Invalid refresh token.");
    }

    const isValid = await bcrypt.compare(currentUser.refreshToken, user.refreshTokenHash);
    if (!isValid) {
      throw new UnauthorizedException("Invalid refresh token.");
    }

    const payload = this.buildPayload(
      user.id,
      user.username,
      user.fullName,
      user.roles.map((role: { roleCode: RoleCode }) => role.roleCode)
    );

    const tokens = await this.signTokens(payload);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10)
      }
    });

    return {
      user: payload,
      ...tokens
    };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: null
      }
    });

    return { message: "Logged out." };
  }

  private buildPayload(
    userId: string,
    username: string,
    fullName: string,
    roleCodes: RoleCode[]
  ): CurrentUserPayload {
    return {
      sub: userId,
      username,
      fullName,
      roleCodes
    };
  }

  private async signTokens(payload: CurrentUserPayload) {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>("JWT_ACCESS_SECRET"),
      expiresIn: (this.configService.get<string>("JWT_ACCESS_EXPIRES_IN") ?? "15m") as never
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
      expiresIn: (this.configService.get<string>("JWT_REFRESH_EXPIRES_IN") ?? "7d") as never
    });

    return {
      accessToken,
      refreshToken
    };
  }
}
