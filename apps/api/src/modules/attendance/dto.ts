import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested
} from "class-validator";
import { AttendanceStatus } from "../../generated/prisma/client";

export enum TeacherObservation {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT"
}

export class BaseCheckRecordDto {
  @ApiProperty()
  @IsUUID()
  studentId!: string;

  @ApiProperty({ enum: [AttendanceStatus.HADIR, AttendanceStatus.ALFA] })
  @IsIn([AttendanceStatus.HADIR, AttendanceStatus.ALFA])
  status!: "HADIR" | "ALFA";

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

export class BaseCheckDto {
  @ApiProperty()
  @IsUUID()
  classId!: string;

  @ApiProperty()
  @IsUUID()
  scheduleId!: string;

  @ApiProperty()
  @IsDateString()
  attendanceDate!: string;

  @ApiProperty({ default: 1 })
  @IsInt()
  @Min(1)
  @Max(1)
  lessonPeriodNo!: number;

  @ApiProperty({ type: [BaseCheckRecordDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BaseCheckRecordDto)
  records!: BaseCheckRecordDto[];
}

export class CrossCheckDto {
  @ApiProperty()
  @IsUUID()
  studentId!: string;

  @ApiProperty()
  @IsUUID()
  classId!: string;

  @ApiProperty()
  @IsUUID()
  scheduleId!: string;

  @ApiProperty()
  @IsDateString()
  attendanceDate!: string;

  @ApiProperty()
  @IsInt()
  @Min(2)
  lessonPeriodNo!: number;

  @ApiProperty({ enum: TeacherObservation })
  @IsEnum(TeacherObservation)
  teacherObservation!: TeacherObservation;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

export class AttendanceCurrentQueryDto {
  @ApiProperty()
  @IsDateString()
  date!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  periodNo!: number;
}

export class AttendanceHistoryQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
