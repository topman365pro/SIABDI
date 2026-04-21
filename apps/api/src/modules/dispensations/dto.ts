import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min
} from "class-validator";

export class CreateDispensationDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsDateString()
  attendanceDate!: string;

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  letterNumber?: string;
}

export class AddDispensationStudentsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID("4", { each: true })
  studentIds!: string[];

  @ApiProperty()
  @IsUUID()
  classId!: string;
}
