import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min
} from "class-validator";
import { BkPermissionKind } from "../../generated/prisma/client";

export class CreateBkPermissionDto {
  @ApiProperty()
  @IsUUID()
  studentId!: string;

  @ApiProperty()
  @IsUUID()
  classId!: string;

  @ApiProperty()
  @IsDateString()
  attendanceDate!: string;

  @ApiProperty({ enum: BkPermissionKind })
  @IsEnum(BkPermissionKind)
  permissionKind!: BkPermissionKind;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  startPeriodNo!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  endPeriodNo!: number;

  @ApiProperty({ default: false })
  @IsBoolean()
  returnRequired!: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  expectedReturnPeriodNo?: number;

  @ApiProperty()
  @IsString()
  reason!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  letterNumber?: string;
}

export class BkDashboardQueryDto {
  @ApiProperty()
  @IsDateString()
  date!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  periodNo!: number;
}
