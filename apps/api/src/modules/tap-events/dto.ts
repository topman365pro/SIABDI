import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { TapType } from "../../generated/prisma/client";

export class CreateTapEventDto {
  @ApiProperty()
  @IsString()
  nisInput!: string;

  @ApiProperty()
  @IsString()
  deviceCode!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  externalEventId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  deviceSequence?: bigint | number;

  @ApiProperty()
  @IsDateString()
  tappedAt!: string;

  @ApiProperty({ required: false })
  rawPayload?: Record<string, unknown>;
}

export class CreateRawTapEventDto extends CreateTapEventDto {
  @ApiProperty({ enum: TapType })
  @IsEnum(TapType)
  tapType!: TapType;
}
