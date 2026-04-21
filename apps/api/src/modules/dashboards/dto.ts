import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
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
import { TeacherObservation } from "../attendance/dto";
import { AttendanceStatus } from "../../generated/prisma/client";

export class TeacherSchedulesQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class TeacherClassPeriodQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class TeacherVerifyRecordDto {
  @ApiProperty()
  @IsUUID()
  studentId!: string;

  @ApiPropertyOptional({ enum: [AttendanceStatus.HADIR, AttendanceStatus.ALFA] })
  @IsOptional()
  @IsIn([AttendanceStatus.HADIR, AttendanceStatus.ALFA])
  status?: "HADIR" | "ALFA";

  @ApiPropertyOptional({ enum: TeacherObservation })
  @IsOptional()
  @IsEnum(TeacherObservation)
  teacherObservation?: TeacherObservation;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class TeacherVerifyPeriodDto {
  @ApiProperty()
  @IsDateString()
  attendanceDate!: string;

  @ApiProperty()
  @IsUUID()
  scheduleId!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  lessonPeriodNo!: number;

  @ApiProperty({ type: [TeacherVerifyRecordDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TeacherVerifyRecordDto)
  records!: TeacherVerifyRecordDto[];
}

export class ParentStudentTimelineQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
