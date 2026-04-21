import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsEnum } from "class-validator";
import { RoleCode, StaffPositionCode } from "../../generated/prisma/client";

export class AssignRolesDto {
  @ApiProperty({ enum: RoleCode, isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(RoleCode, { each: true })
  roleCodes!: RoleCode[];
}

export class AssignStaffPositionsDto {
  @ApiProperty({ enum: StaffPositionCode, isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(StaffPositionCode, { each: true })
  positionCodes!: StaffPositionCode[];
}
