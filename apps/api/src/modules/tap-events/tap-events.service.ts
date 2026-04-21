import { Injectable } from "@nestjs/common";
import { Prisma, TapType } from "../../generated/prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { CreateRawTapEventDto, CreateTapEventDto } from "./dto";

@Injectable()
export class TapEventsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.tapEvent.findMany({
      orderBy: { tappedAt: "desc" }
    });
  }

  tapIn(body: CreateTapEventDto) {
    return this.createTapEvent({ ...body, tapType: TapType.IN });
  }

  tapOut(body: CreateTapEventDto) {
    return this.createTapEvent({ ...body, tapType: TapType.OUT });
  }

  async createTapEvent(body: CreateRawTapEventDto) {
    const student = await this.prisma.student.findUnique({
      where: { nis: body.nisInput }
    });

    const device = await this.prisma.tapDevice.findUnique({
      where: { deviceCode: body.deviceCode }
    });

    return this.prisma.tapEvent.create({
      data: {
        studentId: student?.id,
        nisInput: body.nisInput,
        tapType: body.tapType,
        tappedAt: new Date(body.tappedAt),
        deviceId: device?.id,
        externalEventId: body.externalEventId,
        deviceSequence:
          typeof body.deviceSequence === "number" ? BigInt(body.deviceSequence) : body.deviceSequence,
        rawPayload: (body.rawPayload ?? {}) as Prisma.InputJsonValue
      }
    });
  }
}
